import {ID, Category, Record, User, CategoryUpdate, RecordUpdate, UserUpdate} from '../types';

export abstract class DBInterface {
    public abstract nextCategorySequence(): Promise<ID>;
    public abstract nextRecordSequence(): Promise<ID>;
    public abstract nextUserSequence(): Promise<ID>;

    public abstract addCategory(category: Category): Promise<boolean>;
    public abstract getCategories(): Promise<Array<Category>>;
    public abstract getCategoryBy(descriptor: string): Promise<Category>;
    public abstract getCategoryById(id: ID): Promise<Category>;
    public abstract updateCategory(id: ID, category: CategoryUpdate): Promise<boolean>;

    public abstract addRecord(record: Record): Promise<boolean>;
    public abstract getRecords(): Promise<Array<Record>>;
    public abstract getRecordById(id: ID): Promise<Record>;
    public abstract updateRecord(id: ID, record: RecordUpdate): Promise<boolean>;

    public abstract addUser(user: User): Promise<boolean>;
    public abstract getUsers(): Promise<Array<User>>;
    public abstract getUserById(id: ID): Promise<User>;
    public abstract getUserBy(field: 'associatedId' | 'nickname', value: string): Promise<User>;
    public abstract updateUser(id: ID, user: UserUpdate): Promise<boolean>;

    public abstract reset(): Promise<boolean>;
}
