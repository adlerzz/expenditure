import {DBInterface} from './DBInterface';
import {Client} from 'pg';
import {
    Category,
    CategoryCreate,
    CategoryUpdate,
    ID,
    Record,
    RecordCreate,
    RecordUpdate,
    User, UserCreate,
    UserUpdate
} from '../types';
import {DateUtils} from '../date-utils';

export class DBAdapter extends DBInterface {

    private client: Client;

    constructor(dbOptions?: object) {
        super();
        this.client = new Client(dbOptions);
        this.client.connect();
    }

    private static DBCastToCategory(row: object): Category {
        return ({
            id: row['id'],
            parentId: row['parent_id'],
            name: row['name'],
            aliases: row['aliases'] ?? []
        } as Category);
    }

    private static DBCastToRecord(row: object): Record {
        return ({
            id: row['id'],
            categoryId: row['category_id'],
            userId: row['user_id'],
            value: row['value'],
            timestamp: row['timestamp'],
            comment: row['comment'],
            messageId: row['messageId']
        }) as Record;
    }

    private static DBCastToUser(row: object): User {
        return ({
            id: row['id'],
            nickname: row['nickname'],
            role: row['role'],
            associatedId: row['associated_id']
        }) as User;
    }

    private async refreshViews(){
        await this.client.query(`REFRESH MATERIALIZED VIEW outcomes`);
        await this.client.query(`REFRESH MATERIALIZED VIEW incomes`);
    }

    public async addCategory(category: CategoryCreate): Promise<boolean> {
        const query = `INSERT INTO CATEGORIES (PARENT_ID, NAME, ALIASES) VALUES ($1, $2, $3)`;
        const result = await this.client.query(query, [category.parentId, category.name, category.aliases]);
        // console.log(result);
        await this.client.query(`COMMIT`);
        await this.refreshViews();
        return result;
    }

    public async getCategories(): Promise<Array<Category>> {
        const query = `SELECT * FROM CATEGORIES`;
        const select = await this.client.query(query);
        const result = select.rows.map(DBAdapter.DBCastToCategory);
        // console.log(result);
        return result;
    }

    public async getOutcomesCategories(): Promise<Array<Category>> {
        const query = `SELECT * FROM OUTCOMES`;
        const select = await this.client.query(query);
        const result = select.rows.map(DBAdapter.DBCastToCategory);
        // console.log(result);
        return result;
    }

    public async getIncomesCategories(): Promise<Array<Category>> {
        const query = `SELECT * FROM INCOMES`;
        const select = await this.client.query(query);
        const result = select.rows.map(DBAdapter.DBCastToCategory);
        // console.log(result);
        return result;
    }

    public async getCategoryBy(descriptor: string): Promise<Category|null> {
        const query = `SELECT * FROM CATEGORIES WHERE NAME = $1 OR $1 = ANY (ALIASES)`;
        const select = await this.client.query(query, [descriptor.toUpperCase()]);
        const result = select.rows.map(DBAdapter.DBCastToCategory).pop() ?? null;
        // console.log(result);
        return result;
    }

    public async getCategoryById(id: ID): Promise<Category> {
        const query = `SELECT * FROM CATEGORIES WHERE ID = $1`;
        const select = await this.client.query(query, [id]);
        const result = select.rows.map(DBAdapter.DBCastToCategory).pop();
        // console.log(result);
        return result;
    }

    public async updateCategory(id: ID, category: CategoryUpdate): Promise<boolean> {



        const fields = Object.entries(category).map(([property, value]) => ({property, value}))
            .filter( entry => entry.value !== undefined)
        const af = fields.find(field => field.property === 'aliases');
        if(af) {
            const arr = (af.value as Array<string>).map(alias => `"${alias}"`).join(', ');
            af.value = `'{${arr}}'`;
        }
        const set = fields.map( field => `${field.property} = ${field.value}`).join(', ');
        const query = `UPDATE CATEGORIES SET ${set} WHERE ID = $1`;
        const result = await this.client.query(query, [id]);
        // console.log(result);
        await this.client.query(`COMMIT`);
        await this.refreshViews();
        return result;
    }

    public async addRecord(record: RecordCreate): Promise<boolean> {
        const query = `INSERT INTO RECORDS (CATEGORY_ID, USER_ID, VALUE, TIMESTAMP, COMMENT, MESSAGE_ID) 
                        VALUES ($1, $2, $3, $4, $5, $6)`;
        const result = await this.client.query(query, [record.categoryId, record.userId, record.value, record.timestamp, record.comment, record.messageId]);
        // console.log(result);
        await this.client.query(`COMMIT`);
        await this.refreshViews();
        return !!result;
    }

    public async getRecords(): Promise<Array<Record>> {
        const query = `SELECT * FROM RECORDS`;
        const select = await this.client.query(query);
        const result = select.rows.map(DBAdapter.DBCastToRecord);
        // console.log(result);
        return result ?? [];
    }

    public async getRecordById(id: ID): Promise<Record> {
        const query = `SELECT * FROM RECORDS WHERE ID = $1`;
        const select = await this.client.query(query, [id]);
        const result = select.rows.map(DBAdapter.DBCastToRecord).pop();
        // console.log(result);
        return result;
    }

    public async getRecordByMessageId(messageId: number): Promise<Record> {
        const query = `SELECT * FROM RECORDS WHERE MESSAGE_ID = $1`;
        const select = await this.client.query(query, [messageId]);
        const result = select.rows.map(DBAdapter.DBCastToRecord).pop();
        // console.log(result);
        return result;
    }

    public async updateRecord(id: ID, record: RecordUpdate): Promise<boolean> {
        const fields = Object.entries(record).map(([property, value]) => ({property, value}))
            .filter( entry => entry.value !== undefined)

        const df = fields.find(field => field.property === 'timestamp');
        if(df) {
            const date =  DateUtils.formatDate(df.value as Date);
            df.value = `timestamp '${date}' at time zone 'utc'`;
        }
        const cf = fields.find(field => field.property === 'categoryId');
        if(cf) {
            cf.property = 'category_id';
        }
        const set = fields.map( field => `${field.property} = ${field.value}`).join(', ');
        const query = `UPDATE RECORDS SET ${set} WHERE ID = $1`;
        console.log({query});
        const result = await this.client.query(query, [id]);
        // console.log(result);
        await this.client.query(`COMMIT`);
        await this.refreshViews();
        return !!result;
    }

    public async addUser(user: UserCreate): Promise<boolean> {
        const query = `INSERT INTO USERS (NICKNAME, ROLE, ASSOCIATED_ID) VALUES ($1, $2, $3)`;
        const result = await this.client.query(query, [user.nickname, user.role, user.associatedId]);
        // console.log(result);
        await this.client.query(`COMMIT`);
        return !!result;
    }

    public async getUsers(): Promise<Array<User>> {
        const query = `SELECT * FROM USERS`;
        const select = await this.client.query(query);
        const result = select.rows.map(DBAdapter.DBCastToUser);
        // console.log(result);
        return result;
    }

    public async getUsersBy(role: string): Promise<Array<User>>{
        const query = `SELECT * FROM USERS WHERE ROLE = $1`;
        const select = await this.client.query(query, [role]);
        const result = select.rows.map(DBAdapter.DBCastToUser);
        // console.log(result);
        return result;
    }

    public async getUserBy(field: "associatedId" | "nickname", value: string|number): Promise<User> {
        const column = {
            'associatedId': 'associated_id',
            'nickname': 'nickname'
        }[field];
        const query = `SELECT * FROM USERS WHERE ${column} = $1`;
        const select = await this.client.query(query, [value]);
        const result = select.rows.map(DBAdapter.DBCastToUser).pop();
        // console.log(result);
        return result;
    }

    public async getUserById(id: ID): Promise<User> {
        const query = `SELECT * FROM USERS WHERE ID = $1`;
        const select = await this.client.query(query, [id]);
        const result = select.rows.map(DBAdapter.DBCastToUser).pop();
        // console.log(result);
        return result;
    }


    public async updateUser(id: ID, user: UserUpdate): Promise<boolean> {
        const fields = Object.entries(user).map(([property, value]) => ({property, value}))
            .filter( entry => entry.value !== undefined)

        const set = fields.map( field => `${field.property} = ${field.value}`).join(', ');
        const query = `UPDATE USERS SET ${set} WHERE ID = $1`;
        const result = await this.client.query(query, [id]);
        // console.log(result);
        await this.client.query(`COMMIT`);

        return !!result;
    }

    public async reset(): Promise<boolean> {
        await this.client.query(`TRUNCATE TABLE CATEGORIES, RECORDS, USERS`);
        await this.client.query(`COMMIT`);
        await this.client.query(`ALTER SEQUENCE CATEGORIES_SEQ RESTART`);
        await this.client.query(`ALTER SEQUENCE RECORDS_SEQ RESTART`);
        await this.client.query(`ALTER SEQUENCE USERS_SEQ RESTART`);
        await this.client.query(`COMMIT`);
        await this.client.query(`INSERT INTO CATEGORIES (NAME) VALUES ('ROOT')`);
        await this.client.query(`INSERT INTO USERS (ROLE, ASSOCIATED_ID) VALUES ('ZERO', -1)`);
        await this.client.query(`COMMIT`);
        return Promise.resolve(true);
    }


}
