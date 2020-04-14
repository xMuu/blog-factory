---
title: Android 开发中使用 Room 快速构建 SQLite 数据库
date: 2020-04-01 20:52:04
tags:
  - Android
  - Room
  - SQLite
  - Database
---

Room 是 Google 提供的一个 ORM (Object Relational Mapping) 库，可以在 Android 开发中快速流畅地进行数据库访问。Room 提供了一个访问 SQLite 的抽象层，通过解析注解内容自动生成对应代码，大大提高了开发的效率。

<!-- more -->

Room 包含 3 个主要组件：

- [**数据库**](https://developer.android.google.cn/reference/androidx/room/Database?hl=zh-cn)：包含数据库持有者，并作为应用已保留的持久关系型数据的底层连接的主要接入点。
- [**Entity**](https://developer.android.google.cn/training/data-storage/room/defining-data?hl=zh-cn)：表示数据库中的表。
- [**DAO**](https://developer.android.google.cn/training/data-storage/room/accessing-data?hl=zh-cn)：包含用于访问数据库的方法。

具体的各个组件的说明请查阅官方文档（[地址](https://developer.android.google.cn/training/data-storage/room?hl=zh-cn)）。下面将讲解如何使用 Room 快速构建一个数据库并配合 RecyclerView 输出数据库内容，实现一个简单的购物清单。

> 文中代码重复度较高的地方会进行省略，如果需要完整代码请到文末 GitHub 仓库获取

## 新建工程

在 Android Studio 中创建一个新工程，这里我选用 Basic Activity 模板，你可以根据自己的需求选不同的模板来创建工程。


## 引入依赖

在应用或模块的 build.gradle 文件中添加：

```
dependencies {
  // 设置 Room 版本，此处可能不是最新版，请自行选择是否更新到最新版
  def room_version = "2.2.5"

  implementation "androidx.room:room-runtime:$room_version"
  annotationProcessor "androidx.room:room-compiler:$room_version" 
  // For Kotlin use kapt instead of annotationProcessor
  // 对于 Kotlin 用户请使用 kapt 代替 annotationProcessor

  // optional - Kotlin Extensions and Coroutines support for Room
  // 可选 - Kotlin 扩展和 Coroutines 支持
  implementation "androidx.room:room-ktx:$room_version"

  // optional - RxJava support for Room
  // 可选 - RxJava 支持
  implementation "androidx.room:room-rxjava2:$room_version"

  // optional - Guava support for Room, including Optional and ListenableFuture
  // 可选 - Guava 支持
  implementation "androidx.room:room-guava:$room_version"

  // Test helpers
  // 测试工具
  testImplementation "androidx.room:room-testing:$room_version"
}
```

添加完成后记得点击右上角的 Sync Now 同步一下依赖。

## 创建数据库

### 创建 Entity

新建一个名为 `ListItem.java` 的文件：

```
@Entity(tableName = "items") // 自定义表名
public class ListItem {
    @PrimaryKey(autoGenerate = true) // 注明此元素为主键并自动生成
    public int ID;

    @ColumnInfo(name = "ItemName") // 自定义列名
    public String Name;

    @ColumnInfo(name = "ItemNumber", defaultValue = "1") // 设置默认值
    public String Number;

    @ColumnInfo(name = "ItemStatus", defaultValue = "false")
    public boolean Status;

    // 需要手动创建一个空的构造函数，否则编译时会报错
    public ListItem() {
    }

    // 这个是为了创建对象时方便的构造函数
    public ListItem(String name, String number) {
        Name = name;
        Number = number;
    }

    // 必须为所有的列创建 getter 和 setter 以便进行访问
    public int getID() {
        return ID;
    }

    public void setID(int ID) {
        this.ID = ID;
    }

    ...

}
```


### 实现 DAO 

DAO(Data Access Object, 中文为数据访问对象) 是一个面向对象的数据库接口，所以我们新建一个 `interface` 名为 `ListItemDAO.java` ，实现数据操作的一些定义：

```
@Dao
public interface ListItemDAO {
    @Insert // 插入操作
    void insert(ListItem... items); // 对象类后加三个点表示多个对象，添加时使用逗号分隔

    @Delete // 删除操作
    void delete(ListItem... items);

    @Update // 更新操作
    void update(ListItem... items);

    @Query("SELECT * FROM items") // 查询全部数据，可根据需求添加查询条件
    LiveData<List<ListItem>> getAllItems();

}
```


### 创建 AppDatabase

这一步我们来创建整个 App 的数据库。新建一个文件名为 `AppDatabase.java` ，设置其为 `abstract` 并继承于 `RoomDatabase` ：

> 如果您的应用在单个进程中运行，则在实例化 `AppDatabase` 对象时应遵循单例设计模式。每个 `RoomDatabase` 实例的成本相当高，而您几乎不需要在单个进程中访问多个实例。

```
@Database(entities = {ListItem.class}, version = 1, exportSchema = false)
// 注解中设置好需要使用的实体 entities ，多个请用逗号隔开
// 版本号 version 必须要写，以便后期升级迁移数据库
// exportSchema 如果有需求请打开并实现相应内容，如没实现且没关闭，编译将会报错
public abstract class AppDatabase extends RoomDatabase {
    // 实现单例模式
    private static AppDatabase INSTANCE; 

    public static synchronized AppDatabase getAppDatabase(Context context) {
        if (INSTANCE == null) {
            INSTANCE = Room.databaseBuilder(context.getApplicationContext(), 
                        AppDatabase.class, "AppDatabase").build();
        }
        return INSTANCE;
    }

    // 添加对应的 Dao
    public abstract ListItemDAO getListItemDAO();
}
```

至此，整个数据库已经创建完毕，可以通过 DAO 对数据库进行操作：

```
// 插入数据
ListItem example = new ListItem("牙刷", 2);
AppDatabase appDatabase = AppDatabase.getAppDatabase(context);
ListItemDAO listItemDAO = appDatabase.getListItemDAO();
listItemDAO.insert(example);
```

但是这样操作存在一定问题：

- 直接调用的话，对数据库的操作在主线程上执行，可能会因数据过大而造成 UI 卡顿
- 每次都要获取 AppDatabase 实例和 ListItemDAO ，过程繁琐，代码重复

所以我们来新建一个仓库，用来简化代码，并实现多线程来进行数据库操作，避免卡顿。

### 创建操作仓库

新建名为 `ListItemRepository.java` 的文件：

```
public class ListItemRepository {
    private ListItemDAO listItemDAO;

    public ListItemRepository(Context context) {
        // 获取 AppDatabase 并获取对应 DAO
        AppDatabase appDatabase = AppDatabase.getAppDatabase(context);
        listItemDAO = appDatabase.getListItemDAO();
    }

    // LiveData 类型会自动在进行多线程操作，无需手动新建多线程异步操作任务
    public LiveData<List<ListItem>> getAllItems() {
        return listItemDAO.getAllItems();
    }

    // 调用多线程异步操作任务
    public void addListItem(ListItem... items) {
        new insertAsyncTask(listItemDAO).execute(items);
    }

    ...

    // 创建多线程异步操作任务
    static class insertAsyncTask extends AsyncTask<ListItem, Void, Void> {
        private ListItemDAO listItemDAO;

        insertAsyncTask(ListItemDAO listItemDAO) {
            this.listItemDAO = listItemDAO;
        }

        @Override
        protected Void doInBackground(ListItem... items) {
            listItemDAO.insert(items);
            return null;
        }
    }

    ...

}

```

现在我们就可以用这样的方式来操作数据库了：

```
// 一次创建，多次使用，多线程操作，不会导致 UI 卡顿
ListItem example = new ListItem("牙刷", 2);
ListItemRepository repository = new ListItemRepository(context);
repository.addListItem(example);
repository.addListItem(example);

// 也可以直接新建一个仓库并使用
new ListItemRepository(context).updateListItem(temp);
```

这样代码写起来就非常方便了，不用再啰啰嗦嗦去获取 DAO 。


## 创建 RecyclerView 

现在我们来正式使用数据库。在布局文件中添加 RecyclerView 并新建对应文件。这里以 `fragment_first.xml` 为例：

```
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".FirstFragment">

    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/list"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent"/>

</androidx.constraintlayout.widget.ConstraintLayout>
```

### 创建布局文件

以 `item_list.xml` 为例：

```
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/list_item">

    <CheckBox
        android:id="@+id/checkbox"
        android:layout_width="wrap_content"
        android:layout_height="match_parent"
        android:clickable="false"
        android:layout_margin="10dp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"/>

    <TextView
        android:id="@+id/item_name"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:textSize="24sp"
        android:text="@string/app_name"
        android:layout_marginHorizontal="10dp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toEndOf="@id/checkbox"/>

    <TextView
        android:id="@+id/item_number"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:textSize="22sp"
        android:text="@string/app_name"
        android:layout_marginHorizontal="20dp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"/>

</androidx.constraintlayout.widget.ConstraintLayout>
```

### 创建 Adapter

以 `ListAdapter.java` 为例：

```
public class ListAdapter extends RecyclerView.Adapter<ListAdapter.ItemViewHolder> {

    private List<ListItem> mData;
    
    // 创建构造函数，传入数据
    public ListAdapter(List<ListItem> mData) {
        this.mData = mData;
    }

    @NonNull
    @Override
    public ItemViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        return new ItemViewHolder(LayoutInflater.from(parent.getContext()).inflate(
                R.layout.item_list, parent, false));
    }

    // 重写元素绑定逻辑
    @Override
    public void onBindViewHolder(@NonNull ItemViewHolder holder, final int position) {
        // 设置元素内容
        holder.itemStatus.setChecked(mData.get(position).Status);
        holder.itemName.setText(mData.get(position).Name);
        String number = "数量：" + mData.get(position).Number;
        holder.itemNumber.setText(number);
        // 添加单击修改状态事件
        holder.itemView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                ListItem temp = mData.get(position);
                temp.Status = !temp.Status;
                new ListItemRepository(v.getContext()).updateListItem(temp);
            }
        });
        // 添加长按删除事件
        holder.itemView.setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View v) {
                final ListItem temp = mData.get(position);
                new ListItemRepository(v.getContext()).deleteListItem(temp);
                Snackbar.make(v, "物品已删除", Snackbar.LENGTH_LONG)
                        .setAction("撤销", new View.OnClickListener() {
                            @Override
                            public void onClick(View v) {
                                new ListItemRepository(v.getContext()).addListItem(temp);
                            }
                        }).show();
                return true;
            }
        });
    }

    @Override
    public int getItemCount() {
        return mData.size();
    }

    // 绑定列表项目的各个元素
    static class ItemViewHolder extends RecyclerView.ViewHolder {
        CheckBox itemStatus;
        TextView itemName, itemNumber;
        ItemViewHolder(@NonNull View itemView) {
            super(itemView);
            itemStatus = itemView.findViewById(R.id.checkbox);
            itemName = itemView.findViewById(R.id.item_name);
            itemNumber = itemView.findViewById(R.id.item_number);
        }
    }
}
```

### 设置 RecyclerView

在对应的位置添加上 RecyclerView 的初始化代码，这里以 `FirstFragment.java` 为例：

```
public class FirstFragment extends Fragment {

    private RecyclerView recyclerView;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, 
                              Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_first, container, false);
    }

    public void onViewCreated(@NonNull View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        ListItemRepository repository = new ListItemRepository(view.getContext());
        // 绑定 RecyclerView
        recyclerView = view.findViewById(R.id.list);
        // 设置 RecyclerView 布局管理器
        recyclerView.setLayoutManager(new LinearLayoutManager(view.getContext()));
        // 动态监听 ListItem 的变化并设置 RecyclerView Adapter
        repository.getAllItems().observe(getViewLifecycleOwner(), new Observer<List<ListItem>>() {
            @Override
            public void onChanged(List<ListItem> listItems) {
                recyclerView.setAdapter(new ListAdapter(listItems));
            }
        });
    }
}
```

## 添加按钮功能

给 `MainActivity` 的浮动按钮添加一个弹出对话框的效果，用来添加新物品到数据库：

```
public class MainActivity extends AppCompatActivity {

    private ListItemRepository repository;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        repository = new ListItemRepository(getApplicationContext());

        FloatingActionButton fab = findViewById(R.id.fab);
        // 为浮动按钮设置点击监听
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                createNewItemDialog(view).show();
            }
        });
    }

    // 创建对话框
    private AlertDialog createNewItemDialog(final View view) {
        final View dialogView;
        LayoutInflater inflater = getLayoutInflater();
        AlertDialog.Builder builder = new AlertDialog.Builder(Objects.requireNonNull(view.getContext()));
        dialogView = inflater.inflate(R.layout.dialog_layout, null);
        builder.setTitle("添加新物品").setView(dialogView);
        builder.setPositiveButton("确定", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                TextInputEditText itemNameInput = dialogView.findViewById(R.id.item_name_input);
                TextInputEditText itemNumberInput = dialogView.findViewById(R.id.item_number_input);
                String name = Objects.requireNonNull(itemNameInput.getText()).toString();
                String number = Objects.requireNonNull(itemNumberInput.getText()).toString();
                if (!name.equals("")) {
                    repository.addListItem(new ListItem(name, number));
                    Snackbar.make(view, "物品已添加", Snackbar.LENGTH_SHORT).show();
                } else {
                    Snackbar.make(view, "物品名称不能为空", Snackbar.LENGTH_SHORT).show();
                }
            }
        });
        builder.setNegativeButton("取消", null);
        return builder.create();
    }
}
```

## 效果展示

布局不太好看，不要介意，看效果就好。

![效果图](https://upload.cc/i1/2020/04/14/EgIUnK.png)

## 源码以及 Demo

整个过程的源码已经上传到 GitHub ，项目地址：[点这里](https://github.com/xMuu/Shopping-List) ，如有错误或瑕疵，欢迎提出。

如果想试试整个 App 的效果可以到[这里](https://github.com/xMuu/Shopping-List/releases)下载体验。


