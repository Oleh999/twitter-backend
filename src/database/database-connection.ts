import { Connection, createConnection } from 'mongoose';

export class DatabaseConnection extends Connection {
    public static createConnection(): DatabaseConnection {
        return createConnection(
            process.env.MONGO_URL,
            {
                user: process.env.MONGO_USER,
                pass: process.env.MONGO_PASSWORD,
                dbName: 'test_db',
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useFindAndModify: false
            }
        );
    }
}
