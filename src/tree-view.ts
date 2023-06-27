import * as vscode from 'vscode';
import * as mysql from 'mysql2/promise';

export class DatabaseProvider implements vscode.TreeDataProvider<DatabaseItem> {

    constructor(private connection: mysql.Connection) {
        
    }

    getTreeItem(element: DatabaseItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: DatabaseItem): vscode.ProviderResult<DatabaseItem[]> {
        if (element === undefined) {
            return this.getDatabases();
        }
        return element.getChildren();
    }

    private async getDatabases(): Promise<DatabaseItem[]> {
        // Code to fetch the list of databases and return DatabaseItem array
        // return empty list for now
        return Promise.resolve([
            new DatabaseItem(
                'localhost', 
                vscode.TreeItemCollapsibleState.Collapsed,
                'connection',
                this.connection,
                new vscode.ThemeIcon('server-process')
            )
        ]);
    }
}

// class ColumnItem extends vscode.TreeItem {
//     constructor(
//         public readonly label: string,
//         readonly description?: string,
//     ) {
//         super(label, vscode.TreeItemCollapsibleState.None);
//             this.contextValue = 'column';
//         this.iconPath = new vscode.ThemeIcon('split-horizontal');

//     }
// }


class DatabaseItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly itemType: string,
        private readonly connection: mysql.Connection,
        readonly iconPath?: string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri } | vscode.ThemeIcon,
        readonly description?: string,
    ) {
        super(label, collapsibleState);
    }

    async getChildren(): Promise<DatabaseItem[]> {
        if (this.itemType === 'connection') {
            const [rows] = await this.connection.query('SHOW DATABASES');
            if (Array.isArray(rows)) {
                return rows.map((row: any) => {
                    return new DatabaseItem(
                        row.Database, 
                        vscode.TreeItemCollapsibleState.Collapsed,
                        'database',
                        this.connection,
                        new vscode.ThemeIcon('database'),
                        ''
                    );
                });
            }
            return [];
        } else if (this.itemType === 'database') {
            // Code to fetch the tables in the database and return DatabaseItem array
            // return empty list for now
            await this.connection.query('USE ' + this.label);
            // 
            const [rows] = await this.connection.query('select TABLE_NAME, TABLE_ROWS,TABLE_COMMENT from information_schema.tables where TABLE_SCHEMA = ?', [this.label]);
            if (Array.isArray(rows)) {
                return rows.map((row: any) => {
                    return new DatabaseItem(
                        row['TABLE_NAME'], 
                        vscode.TreeItemCollapsibleState.Collapsed,
                        'table',
                        this.connection,
                        new vscode.ThemeIcon('table'),
                        `${row['TABLE_ROWS']}`
                    );
                });
            }
        } else if (this.itemType === 'table') {
            // Code to fetch the columns in the table and return DatabaseItem array
            // return empty list for now
            const [rows] = await this.connection.query('DESCRIBE ' + this.label);
            if (Array.isArray(rows)) {
                return rows.map((row: any) => {
                    return new DatabaseItem(
                        row.Field,
                        vscode.TreeItemCollapsibleState.None,
                        'column',
                        this.connection,
                        new vscode.ThemeIcon('split-horizontal'),
                        `${row.Type}`
                    );
                });
            } //new vscode.ThemeIcon('column')
            return Promise.resolve([]);
        }
        return Promise.resolve([]);
    }
}