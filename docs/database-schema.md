# Database Schema

## Tables
The database contains four tables
- users: contains information about the users of the website
- products: contains information about the products available on the website
- interactions: contains information about the interactions of the users with the website
- checkouts: contains information about purchases made on the website

## Schemas
### Users
<table>
    <tr>
        <th>Field Names</th>
        <th>Data Type</th>
    </tr>
    <tr>
        <td>id</td>
        <td>INTEGER PRIMARY KEY AUTO INCREMENT</td>
    </tr>
    <tr>
        <td>fname</td>
        <td>TEXT</td>
    </tr>
    <tr>
        <td>lname</td>
        <td>TEXT</td>
    </tr>
    <tr>
        <td>username</td>
        <td>TEXT UNIQUE</td>
    </tr>
    <tr>
        <td>password</td>
        <td>TEXT</td>
    </tr>
</table>

### Products
<table>
    <tr>
        <th>Field Names</th>
        <th>Data Type</th>
    </tr>
    <tr>
        <td>id</td>
        <td>INTEGER PRIMARY KEY AUTOINCREMENT</td>
    </tr>
    <tr>
        <td>name</td>
        <td>TEXT</td>
    </tr>
    <tr>
        <td>price</td>
        <td>REAL</td>
    </tr>
    <tr>
        <td>quantity</td>
        <td>INTEGER</td>
    </tr>
</table>

### Interactions
<table>
    <tr>
        <th>Field Names</th>
        <th>Data Type</th>
    </tr>
    <tr>
        <td>id</td>
        <td>INTEGER PRIMARY KEY AUTOINCREMENT</td>
    </tr>
    <tr>
        <td>user_id REFERENCES users(id)</td>
        <td>INTEGER</td>
    </tr>
    <tr>
        <td>date</td>
        <td>DATETIME</td>
    </tr>
    <tr>
        <td>action</td>
        <td>TEXT</td>
    </tr>
</table>

### Checkouts
<table>
    <tr>
        <th>Field Names</th>
        <th>Data Type</th>
    </tr>
    <tr>
        <td>id</td>
        <td>INTEGER PRIMARY KEY AUTOINCREMENT</td>
    </tr>
    <tr>
        <td>user_id</td>
        <td>INTEGER REFERENCES users(id)</td>
    </tr>
    <tr>
        <td>date</td>
        <td>DATETIME</td>
    </tr>
    <tr>
        <td>cost</td>
        <td>REAL</td>
    </tr>
    <tr>
        <td>email</td>
        <td>TEXT</td>
    </tr>
    <tr>
        <td>phone</td>
        <td>DECIMAL(10, 0)</td>
    </tr>
    <tr>
        <td>address</td>
        <td>TEXT</td>
    </tr>
</table>