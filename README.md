# 🎓 Graduate Location Map

一个交互式的毕业生去向地图应用，可视化展示不同社团、不同年份的毕业生分布在哪些城市，以及他们从事的行业。

## 功能特点

- 🗺️ **交互式地图**：使用 Leaflet 展示毕业生的地理位置
- 🏛️ **社团筛选**：按社团/组织筛选毕业生
- 📅 **年份筛选**：按毕业年份筛选
- 💼 **行业信息**：查看每个城市的毕业生从事的行业
- 📊 **统计分析**：查看热门城市和行业的统计图表
- 👥 **学生详情**：点击地图标记查看该城市所有学生的详细信息

## 技术栈

### 前端
- React 18
- Vite (构建工具)
- React-Leaflet (地图组件)
- Axios (HTTP 客户端)

### 后端
- Node.js + Express
- PostgreSQL (数据库)
- pg (PostgreSQL 客户端)

## 项目结构

```
CS4111/
├── server/              # 后端服务器
│   ├── index.js        # Express API 服务器
│   └── geoUtils.js     # GeoJSON 工具函数
├── src/                # React 前端
│   ├── components/     # React 组件
│   │   ├── GraduateMap.jsx      # 地图组件
│   │   ├── FilterPanel.jsx      # 筛选面板
│   │   └── Statistics.jsx       # 统计面板
│   ├── App.jsx         # 主应用组件
│   ├── main.jsx        # 入口文件
│   └── index.css       # 全局样式
├── package.json        # 依赖配置
├── vite.config.js      # Vite 配置
└── .env                # 环境变量（数据库配置）
```

## 安装步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

创建 `.env` 文件（如果不存在）并配置数据库连接：

```env
DB_USER=jc6292
DB_HOST=34.139.8.30
DB_NAME=proj1part2
DB_PASSWORD=854037
DB_PORT=5432
PORT=3001
```

### 3. 启动应用

#### 方式一：同时启动前端和后端
```bash
npm run dev
```

这会同时启动：
- 后端服务器：http://localhost:3001
- 前端开发服务器：http://localhost:3000

#### 方式二：分别启动

启动后端服务器：
```bash
npm run server
```

启动前端开发服务器：
```bash
npm run client
```

### 4. 访问应用

在浏览器中打开：http://localhost:3000

## API 接口

### 获取所有社团
```
GET /api/clubs
```

### 获取所有毕业年份
```
GET /api/years
```

### 获取毕业生位置数据
```
GET /api/graduate-locations?club_id={club_id}&year={year}
```
参数：
- `club_id` (可选): 社团ID
- `year` (可选): 毕业年份

### 获取统计数据
```
GET /api/statistics?club_id={club_id}&year={year}
```

## 使用说明

1. **查看所有毕业生**：打开应用后，地图会显示所有毕业生的位置
2. **筛选社团**：在顶部选择特定社团，查看该社团成员的分布
3. **筛选年份**：选择毕业年份，查看该年份毕业生的分布
4. **查看详情**：点击地图上的标记，查看该城市所有学生的详细信息
5. **查看统计**：点击"Show Statistics"按钮，查看热门城市和行业的统计图表

## 地图说明

- **圆圈大小**：表示该城市的毕业生数量
- **圆圈颜色**：
  - 🟢 绿色：1个毕业生
  - 🟡 黄色：2个毕业生
  - 🟠 橙色：3-4个毕业生
  - 🔴 红色：5个或更多毕业生

## 数据库结构

应用连接到以下数据库表：
- `student` - 学生基本信息
- `club` - 社团信息
- `location` - 地点信息
- `industry` - 行业信息
- `graduated_in` - 毕业记录
- `lives_in` - 居住记录
- `works_in` - 工作记录
- `member_of` - 社团成员记录

## 生产环境构建

构建生产版本：
```bash
npm run build
```

预览生产构建：
```bash
npm run preview
```

## 故障排除

### 数据库连接失败
- 检查 `.env` 文件中的数据库配置是否正确
- 确保数据库服务器可访问
- 检查防火墙设置

### 地图不显示
- 确保安装了所有依赖：`npm install`
- 检查浏览器控制台是否有错误
- 确认 Leaflet CSS 已正确加载

### API 请求失败
- 确保后端服务器正在运行（端口 3001）
- 检查 Vite 代理配置是否正确
- 查看后端服务器日志

## 开发者

- 项目：CS4111 Database Project
- 数据库：proj1part2
- 用户：jc6292

## License

MIT

