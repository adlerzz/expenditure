import {
    ID,
    Category,
    Record,
    User,
    CategoryUpdate,
    RecordUpdate,
    UserUpdate,
    CategoryCreate,
    RecordCreate, UserCreate
} from '../types';

export abstract class DBInterface {

    public abstract addCategory(category: CategoryCreate): Promise<boolean>;
    public abstract getCategories(): Promise<Array<Category>>;
    public abstract getCategoryBy(descriptor: string): Promise<Category| null>;
    public abstract getCategoryById(id: ID): Promise<Category>;
    public abstract updateCategory(id: ID, category: CategoryUpdate): Promise<boolean>;

    public abstract addRecord(record: RecordCreate): Promise<boolean>;
    public abstract getRecords(): Promise<Array<Record>>;
    public abstract getRecordById(id: ID): Promise<Record>;
    public abstract updateRecord(id: ID, record: RecordUpdate): Promise<boolean>;

    public abstract addUser(user: UserCreate): Promise<boolean>;
    public abstract getUsers(): Promise<Array<User>>;
    public abstract getUsersBy(role: string): Promise<Array<User>>;
    public abstract getUserById(id: ID): Promise<User>;
    public abstract getUserBy(field: 'associatedId' | 'nickname', value: string|number): Promise<User | null>;
    public abstract updateUser(id: ID, user: UserUpdate): Promise<boolean>;

    public abstract reset(): Promise<boolean>;
}
