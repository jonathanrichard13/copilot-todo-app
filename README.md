# Todo List API

A robust RESTful API for managing todo lists and tasks built with TypeScript, Express.js, and SQLite.

## 🚀 Features

- **Multiple Lists**: Create and manage multiple todo lists
- **Task Management**: Full CRUD operations for tasks with deadlines and priorities
- **Advanced Filtering**: Filter tasks by completion status, priority, and deadlines
- **Database Flexibility**: Switch between in-memory and SQL database implementations
- **Type Safety**: Built with TypeScript for robust type checking
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Database Migrations**: Automated database schema management
- **Seeded Data**: Pre-populated sample data for testing

## 📋 API Endpoints

### Health Check
- `GET /health` - API health status

### Lists
- `GET /api/lists` - Get all lists (optional: `?withTasks=true`)
- `GET /api/lists/:id` - Get a specific list by ID
- `POST /api/lists` - Create a new list
- `PUT /api/lists/:id` - Update a list
- `DELETE /api/lists/:id` - Delete a list

### Tasks
- `GET /api/tasks` - Get all tasks with filtering options
- `GET /api/tasks/:id` - Get a specific task by ID
- `POST /api/lists/:listId/tasks` - Create a new task in a list
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `PATCH /api/tasks/:id/complete` - Toggle task completion status
- `GET /api/tasks/due-this-week` - Get tasks due this week
- `GET /api/tasks/sorted-by-deadline` - Get tasks sorted by deadline

### Query Parameters for Tasks
- `completed` - Filter by completion status (true/false)
- `priority` - Filter by priority (low/medium/high)
- `sortBy` - Sort by field (deadline/createdAt/priority/title)
- `sortOrder` - Sort order (asc/desc)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or later)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-list-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npx ts-node src/app.ts
   ```

The API will be available at `http://localhost:3000`

## 📝 Usage Examples

### Create a List
```bash
curl -X POST http://localhost:3000/api/lists \
  -H "Content-Type: application/json" \
  -d '{"name": "Shopping List", "description": "Grocery items"}'
```

### Create a Task
```bash
curl -X POST http://localhost:3000/api/lists/{listId}/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy milk", "priority": "high", "deadline": "2025-07-05T10:00:00Z"}'
```

### Get Tasks Due This Week
```bash
curl http://localhost:3000/api/tasks/due-this-week
```

### Filter Completed Tasks
```bash
curl "http://localhost:3000/api/tasks?completed=true&sortBy=deadline&sortOrder=asc"
```

## 🏗️ Architecture

### Project Structure
```
src/
├── api/
│   ├── controllers/     # Request handlers
│   └── routes/         # Route definitions
├── config/
│   ├── database.ts     # Database configuration
│   └── environment.ts  # Environment settings
├── middleware/         # Express middleware
├── migrations/         # Database migrations
├── models/            # TypeScript interfaces
├── repositories/      # Data access layer
│   ├── interfaces/    # Repository contracts
│   ├── memory/       # In-memory implementations
│   └── sql/          # SQL implementations
├── services/         # Business logic layer
└── utils/           # Utility functions
```

### Design Patterns
- **Repository Pattern**: Abstracts data access logic
- **Factory Pattern**: Creates repository instances
- **Service Layer**: Contains business logic
- **Dependency Injection**: Loose coupling between layers

## 🗄️ Database

### SQLite Schema

**Lists Table**
- `id` (VARCHAR) - Primary key
- `name` (VARCHAR) - List name
- `description` (TEXT) - Optional description
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Tasks Table**
- `id` (VARCHAR) - Primary key
- `title` (VARCHAR) - Task title
- `description` (TEXT) - Optional description
- `completed` (BOOLEAN) - Completion status
- `deadline` (TIMESTAMP) - Optional deadline
- `priority` (VARCHAR) - Priority level (low/medium/high)
- `list_id` (VARCHAR) - Foreign key to lists table
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### Migration Commands
```bash
npm run migrate        # Run all pending migrations
npm run migrate:up     # Run migrations up
npm run migrate:down   # Rollback last migration
npm run seed          # Seed database with sample data
```

## 🧪 Testing

Run the included test script:
```bash
node test-api.js
```

This tests all major API endpoints and verifies functionality.

## 📋 Development Tasks Status

### ✅ Completed Tasks

#### Task 1: Project Setup ✅
- [x] Initialize npm project with TypeScript configuration
- [x] Setup Vite build configuration for Node.js backend
- [x] Install and configure Express.js with TypeScript
- [x] Setup ESLint and Prettier for code quality
- [x] Configure tsconfig.json for proper TypeScript compilation
- [x] Setup project folder structure
- [x] Create environment configuration
- [x] Setup package.json scripts

#### Task 2: Database Setup and Migration System ✅
- [x] Choose and setup SQL database (SQLite)
- [x] Create database connection configuration
- [x] Implement migration system for database schema changes
- [x] Create initial migration for Lists table
- [x] Create initial migration for Tasks table
- [x] Setup database seeding for development data
- [x] Create migration runner script
- [x] Test migration up/down functionality

#### Task 3: Memory Repository Implementation ✅
- [x] Create IListRepository interface
- [x] Create ITaskRepository interface
- [x] Implement MemoryListRepository class
- [x] Implement MemoryTaskRepository class
- [x] Add CRUD operations for Lists in memory
- [x] Add CRUD operations for Tasks in memory
- [x] Implement task filtering by deadline
- [x] Implement task sorting by deadline
- [x] Add data validation in repository layer

#### Task 4: SQL Database Repository Implementation ✅
- [x] Implement SQLListRepository class
- [x] Implement SQLTaskRepository class
- [x] Create database query methods for Lists CRUD
- [x] Create database query methods for Tasks CRUD
- [x] Implement complex queries (due this week, sorting by deadline)
- [x] Add proper error handling for database operations

#### Task 5: List Service Implementation ✅
- [x] Create ListService class with business logic
- [x] Implement createList method with validation
- [x] Implement updateList method with validation
- [x] Implement deleteList method with cascade handling
- [x] Implement getAllLists method with task population
- [x] Implement getListById method
- [x] Add input validation and sanitization
- [x] Add business rule validation
- [x] Handle error scenarios gracefully

#### Task 6: Task Service Implementation ✅
- [x] Create TaskService class with business logic
- [x] Implement createTask method with validation
- [x] Implement updateTask method with validation
- [x] Implement deleteTask method
- [x] Implement toggleTaskCompletion method
- [x] Implement getTasksDueThisWeek method
- [x] Implement getTasksSortedByDeadline method
- [x] Add deadline validation and date handling
- [x] Add priority level validation

#### Task 7: Express.js Server Setup and Middleware ✅
- [x] Setup Express.js server with TypeScript
- [x] Configure CORS middleware
- [x] Setup JSON body parser middleware
- [x] Add request logging middleware
- [x] Setup error handling middleware
- [x] Configure environment-based settings
- [x] Add health check endpoint
- [x] Setup graceful shutdown handling

#### Task 8: List API Endpoints Implementation ✅
- [x] Create ListController class
- [x] Implement GET /api/lists endpoint with TSDoc
- [x] Implement POST /api/lists endpoint with TSDoc
- [x] Implement PUT /api/lists/:id endpoint with TSDoc
- [x] Implement DELETE /api/lists/:id endpoint with TSDoc
- [x] Add request validation for all endpoints
- [x] Add proper HTTP status codes
- [x] Add error response formatting
- [x] Test all list endpoints manually

#### Task 9: Task API Endpoints Implementation ✅
- [x] Create TaskController class
- [x] Implement POST /api/lists/:listId/tasks endpoint with TSDoc
- [x] Implement PUT /api/tasks/:id endpoint with TSDoc
- [x] Implement DELETE /api/tasks/:id endpoint with TSDoc
- [x] Implement PATCH /api/tasks/:id/complete endpoint with TSDoc
- [x] Implement GET /api/tasks/due-this-week endpoint with TSDoc
- [x] Implement GET /api/tasks?sort=deadline endpoint with TSDoc
- [x] Add query parameter validation
- [x] Add date handling for deadline queries
- [x] Test all task endpoints manually

#### Task 13: Repository Pattern Configuration System ✅
- [x] Create RepositoryFactory pattern
- [x] Implement dependency injection for repositories
- [x] Add environment-based repository selection
- [x] Create configuration for switching between memory/SQL repos
- [x] Test repository switching functionality
- [x] Update service layer to use factory pattern

## 🎯 **MILESTONE 1: CORE API COMPLETED** ✅

The Todo List API is now fully functional with:
- ✅ Working database with migrations and seeding
- ✅ Complete CRUD operations for lists and tasks
- ✅ Advanced filtering and sorting capabilities
- ✅ Proper error handling and validation
- ✅ Repository pattern with SQL and memory implementations
- ✅ RESTful API design with comprehensive endpoints
- ✅ TypeScript type safety throughout
- ✅ Tested and verified functionality

### Next Steps (Future Enhancements)
- [ ] OpenAPI/Swagger documentation
- [ ] Comprehensive testing suite with Jest
- [ ] Authentication and authorization
- [ ] Pagination for large datasets
- [ ] Docker containerization
- [ ] Performance optimization and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
