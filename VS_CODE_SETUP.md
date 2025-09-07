# Running Campus Event Management Platform in VS Code

## Prerequisites

1. **Install VS Code** (if not already installed)
2. **Install Python Extension** for VS Code
3. **Install Python** on your system

## Step-by-Step Setup

### 1. Open Project in VS Code

1. Open VS Code
2. Click `File` → `Open Folder`
3. Navigate to your project folder (`C:\Users\MITHUN\Downloads\WebNot`)
4. Click `Select Folder`

### 2. Install Python Extension

1. Press `Ctrl+Shift+X` to open Extensions
2. Search for "Python"
3. Install the official Python extension by Microsoft

### 3. Set Python Interpreter

1. Press `Ctrl+Shift+P` to open Command Palette
2. Type "Python: Select Interpreter"
3. Choose your Python installation (usually the latest version)

### 4. Install Dependencies

**Method 1: Using VS Code Terminal**
1. Press `Ctrl+`` (backtick) to open terminal
2. Run: `pip install -r requirements.txt`

**Method 2: Using VS Code Tasks**
1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select "Install Dependencies"

### 5. Run the Application

**Method 1: Using Debug Configuration (Recommended)**
1. Press `F5` or go to `Run and Debug` panel (Ctrl+Shift+D)
2. Select "Run Campus Event Backend" from dropdown
3. Click the green play button

**Method 2: Using Terminal**
1. Press `Ctrl+`` to open terminal
2. Run: `python simple_backend_no_qr.py`

**Method 3: Using VS Code Tasks**
1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select "Start Backend Server"

### 6. Open in Browser

**Method 1: Manual**
- Open browser and go to: `http://localhost:5000`

**Method 2: Using VS Code Task**
1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select "Open in Browser"

## VS Code Features You Can Use

### Debugging
- Set breakpoints by clicking left of line numbers
- Use `F5` to start debugging
- Use `F10` to step over, `F11` to step into
- View variables in the Debug Console

### IntelliSense
- Get code completion for Python
- Hover over functions to see documentation
- Use `Ctrl+Space` for suggestions

### Integrated Terminal
- Press `Ctrl+`` to open terminal
- Run Python commands directly
- View server logs and output

### File Explorer
- Navigate between files easily
- Right-click files for context menu options
- Use `Ctrl+P` to quickly open files

## Troubleshooting

### Python Not Found
1. Install Python from python.org
2. Restart VS Code
3. Set correct interpreter path

### Dependencies Not Installing
1. Check if pip is installed: `pip --version`
2. Try: `python -m pip install -r requirements.txt`
3. Use virtual environment if needed

### Port Already in Use
1. Change port in `simple_backend_no_qr.py`
2. Look for line: `app.run(debug=True)`
3. Change to: `app.run(debug=True, port=5001)`

### Browser Not Opening
1. Manually open browser
2. Go to `http://localhost:5000`
3. Check if server is running in terminal

## Useful VS Code Shortcuts

- `Ctrl+`` - Toggle terminal
- `F5` - Start debugging
- `Ctrl+Shift+P` - Command palette
- `Ctrl+P` - Quick open file
- `Ctrl+Shift+F` - Search in files
- `Ctrl+Shift+E` - Explorer panel
- `Ctrl+Shift+D` - Debug panel

## Project Structure in VS Code

```
📁 WebNot/
├── 📁 .vscode/           # VS Code configuration
│   ├── launch.json       # Debug configurations
│   ├── settings.json     # Workspace settings
│   └── tasks.json        # Custom tasks
├── 📄 simple_backend_no_qr.py  # Main backend file
├── 📄 simple_frontend.html     # Frontend file
├── 📄 requirements.txt         # Dependencies
├── 📄 README.md               # Documentation
└── 📄 campus_events.db        # Database (auto-created)
```

## Next Steps

1. **Explore the code** - Click through files to understand structure
2. **Set breakpoints** - Debug the application flow
3. **Modify code** - Make changes and see them live
4. **Use Git** - Initialize version control if needed

Your Campus Event Management Platform is now ready to run in VS Code! 🚀
