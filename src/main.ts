import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import { readFile, writeFile } from 'node:fs/promises';
import started from 'electron-squirrel-startup';
import path from 'node:path';
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createMenu = () => {
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [{ role: 'quit' }],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Editor Settings...',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            BrowserWindow.getFocusedWindow()?.webContents.send('editor-settings:open');
          },
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'close' }],
    },
  ]);

  Menu.setApplicationMenu(menu);
};

const defaultEditorSettings = {
  fontSize: 18,
  disappearanceSpeed: 'medium',
};

const settingsPath = () => path.join(app.getPath('userData'), 'editor-settings.json');

ipcMain.handle('editor-settings:load', async () => {
  try {
    const contents = await readFile(settingsPath(), 'utf8');
    const saved: unknown = JSON.parse(contents);

    if (typeof saved !== 'object' || saved === null) {
      return defaultEditorSettings;
    }

    const value = saved as Record<string, unknown>;

    return {
      fontSize:
        typeof value.fontSize === 'number' &&
        Number.isInteger(value.fontSize) &&
        value.fontSize >= 12 &&
        value.fontSize <= 32
          ? value.fontSize
          : defaultEditorSettings.fontSize,
      disappearanceSpeed:
        value.disappearanceSpeed === 'slow' ||
        value.disappearanceSpeed === 'medium' ||
        value.disappearanceSpeed === 'fast'
          ? value.disappearanceSpeed
          : defaultEditorSettings.disappearanceSpeed,
    };
  } catch {
    // The file may not exist on the first launch.
    return defaultEditorSettings;
  }
});

ipcMain.handle('editor-settings:save', async (_event, settings: unknown) => {
  if (typeof settings !== 'object' || settings === null) {
    throw new Error('Invalid editor settings');
  }

  const value = settings as Record<string, unknown>;

  if (
    typeof value.fontSize !== 'number' ||
    Number.isInteger(value.fontSize) === false ||
    value.fontSize < 12 ||
    value.fontSize > 32 ||
    ['slow', 'medium', 'fast'].includes(String(value.disappearanceSpeed)) === false
  ) {
    throw new Error('Invalid editor settings');
  }

  await writeFile(
    settingsPath(),
    JSON.stringify(
      {
        fontSize: value.fontSize,
        disappearanceSpeed: value.disappearanceSpeed,
      },
      null,
      2,
    ),
    'utf8',
  );
});

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createMenu();
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
