# API Endpoints

## Display Login/Singup Page
- app.get('/')
- Endpoint renders the home page. Gives the user the option to login or signup.

## Signup Endpoint
- app.post('/api/profile')
- Creates a new profile in the database
- Creates a new session for the User
- Updates Interactions database
- Redirects to the products page

## Login Endpoint
- app.post('/api/login')
- Checks if the user exists in the database
- Creates a new session for the User
- Updates Interactions database
- Redirects to the products page

## Logout Endpoint
- app.post('/api/logout')
- Destroys the session for the User
- Redirects to the home page

## Account Details Endpoint
- app.get('/api/account')
- Gets the account details for the user
- Renders the account details page

## Update Account Details Endpoint
- app.put('/api/update')
- Updates the account details for the user
- Updates Interactions database
- Reloads account details page and allows further edits

## Update Password Endpoint
- app.post('/api/update_password')
- Checks password against the database
- If password is a match, updates the password for the user
- Updates Interactions database
- Reloads account details page and allows further edits

## Delete Account Endpoint
- app.delete('/api/delete')
- Deletes the account for the user
- Destroys the session for the user
- Removes information about user from databases
- Redirects to the home page

## Products Endpoint
- app.get('/api/products')
- Gets all the products from the database
- Renders the products page

## Add Product Endpoint
- app.post('/api/products/buy/:id')
- Adds the product to the cart for the user

## Remove Product Endpoint
- app.post('/api/products/remove/:id')
- Removes the product from the cart for the user if quantity is 1
- Decrements the quantity of the product in the cart for the user if quantity is greater than 1

## Checkout Endpoint
- app.post('/api/checkout')
- Gets all the products from the cart for the user
- Renders the checkout page

## Confirm Purchase Endpoint
- app.post('/api/confirm_purchase')
- Updates products database with new quantities
- Deletes all products from the cart for the user
- Updates chekouts database with new purchase
- Redirects to products page and renders the confirmation dialog