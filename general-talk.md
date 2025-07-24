Table: User
Now let's talk about the database, first of all, there are four roles in the database. Super admin ( can access all, edit all, add all). Then come to the admin we can specify its goal by defining specific functionality. 
Then the sales manager can only be part of one thing from the permission drop-down. He can either be a sales manager for any warehouse 1, 2 or showroom 1, 2. (Because of multiple warehouses and multiple showrooms I can only specify one thing so his dashboard will be changed according to the selected permission.
Ui
The super admin can see all of the things like all of the warehouses and showrooms data in totally. But the sales manager only have the access what he permission to. On the other hand admin access can be specified like I can choose multiple permission for him from the permission. Dropdown I can choose Warehouse one and showroom two, or can specify his role for all showroom are all warehouses for one showroom and one warehouses. Basically I can choose anything I want for him. 
And lastly investor they can only see the super admin dashboard but cannot change anything only can see just.

Schema:
If I talk about the UI for adding a user from the super admin: first of all I have to give the full name then email address. Then specify the role like admin, sales manager or investors. When I choose admin I will have a drop down with tic box system so I can choose one or multiphone option from that for his permission. Also show a tick button for adding a permission for adding a new sales manager or not. When I choose a sales manager then the drop down will be changed to the radio button so I can only choose one at a time. 

If I talk about the database schema there will be an ID, name, phone, email, role, permission, status (The super admin can change the status for an user is active or not. If he is inactive he cannot login into the account), last login, password(it must be encrypted. I don't know I had to put it), and lastly profile picture.


--------------------------------------------------
Table: Category 
If I talk about the category in the category form. I have only 2 things, category name and category description.
Super admin, admin and sales manager can add category directly on it, but the investor cannot do any kind of changes. 
If I talk about the UI when I click on add a new category button there will be a pop-up and ask me to add category name and a description. 

In the schema there will be three things only ID category name and category description.

------------------------------------------------------
Now let's talk about other table "suppliers": 
It can be added by super admin and admin only. 

If I talk about that UI there will be a splitted two item, one person and one for company, on the person there will be the supplier person name, email, phone number designation, from the company I can get the actual product. So I need the company name, email address, phone number and address. And also lastly there will be an optional parameter which is the payment term. 

Now if I talk about the schema there will be ID name, company name, email address, phone, address, contact person created at last update and payment. 

------------------------
No, there's talk about elephants in the room,  which are customers. 
In the customer table, Super admin, admin and sales manager can add new customers and edit any kind of previous customer. 
If I talk about the UI of the customer form there will be customer name, email address, phone number, address, company name if any delivery address and there is a text box on delivery address. And I can choose a coupon fixer for the customer using tap on the profile picture field when entering the customer details .If I click on this the address will be the same as the delivery address.

Now if I talk about the schema of this customer table there will be name, emails, phone number, address, customer name, delivery address, created date, customer type image and more according to my full project like the red list, purchases history, last purchase, Total purchase, and more...

-----------
Now if I talk about the product table:
Super admin and admin can add product. 

Now let's talk about the UI:
On the top of the form there will be a field for submitting the product image.
Then a product name, and a drop down for selecting the category (from the category table previously created) 
Product code, product description, Total amount to purchase/ purchase amount,
There will be 3 Fields which are 
1. purchase price, 
2. selling price 
3. Per meter price. 
I have to fill-up the purchase price and selling price the per meter price field will be auto filled with the calculation. But if I click on the perimeter price and change the value, the selling price will be updated according to the per-meter price. I mean that everything will be connected to each other. 
Lot number (it will show by default lot number 0) 
Then click the supplier drop down button where I can choose the supplier (from the previously created supplier table). Then I have to choose the location of loading the newly added products (which are basically warehouses One or Warehouse 2 or other warehouses selected from the drop down). Then I have to choose the minimum threshold auto save to 100m. Basically it will set 100 m because the fabric is heat on the 100 m. It will go to the wastage table. Then I have the payment startups which I have to give the money to the supplier. If I give the full of them I have to click on done or I have a partial amount then I have to give the amount and add a last date when I should give the rest of the money. The date is important because it will remind me or to give the money of the supplier company. Lastly, there will be a name which is the account name (currently logged in) it means it will be stored. Which person is added to the product on the database. 
Now there is a catch, if the product already exists in the product list and I have to increase the new stock, there will be like this: 
On the product name field (basically like a search field. If there are any products that exist I can choose) it will automatically fail the product name, product code, description and current stock (so I can get the exact amount? How much the previous stock is on total warehouses and showrooms). At the same time on the lot option there will be '1' cuz previously I had another lot added. 
It will help me to sell the product exactly the amount, what I have purchased and set the selling price. 
Note that it will work like this:  
FIFO ( Jeta jei price e kinsi oita oi price e out hobe). If I have created the product several times several times, it will update the new state according to the previous  lot number.
Not that the product will be not showing on the list which are on the wastage table.

I talk about the schema of product add
Ad there are ID name, product code for a category (previously created table), purchase amount, purchase price, sitting price. Current stock lot number price supplier previously created_table minimum threshold, date created, Lost sold, wastage (from the wastage table), product status (product is active or slow), location (warehouse or showroom), payment status (Usually for suppliers payment date, like paid or not, remaining amount, last date for payment, images of the product. And much more according to the requirements of the project. 


--------------------------
Now let's talk about the product sale table.

Super admin, admin and sales manager (specific showroom)  can sell the products.
Super admin and admin can sale any kind of product from any of the showrooms, but the sales manager can only sale his permissioned showroom products.

If I talk about the products sell UI,
Before I write the name of the product and choose the product from the drop down (because the product is already on the product list) after choosing that, it will show the product image at the top and current stock of that product. So that I can sell the exact amount I want so it won't be negative in value. Then I have to choose customer from the customer drop down (previously created all customers) it will show the customer info. For example their name last purchased due amount, Read list or not, 
After that I have to choose the lot. Basically from the drop down there will be lot numbers 
Like: Lot 0 - (12/06/2025) - 220 meter.
         Lot 1 - (28/06/2025) - 420 meter.
         Lot 2 - (03/07/2025) - 630 meter.
So I have to choose from the lot. Basically when I purchase a lot at any time it has its purchase amount and a selling amount. After I purchase another amount the amount might be increased from previously or can be decreased on the previously purchased amount. So what I have purchased will show its amount according to the lot number. 
Then I have to be at the sealing quantity in that below it will show the remaining quantity. 
Then The subtotal and I have a field for discount, and set the tax, discount and tax by default zero. I can add on the click of the field. then it will show the total amount. Then the payment method cash or card. And I have to choose the what amount paid and what amount is remaining. The amount is remaining. I have to choose the due date or the last date of the remaining amount. 
Then I have an option to set the delivery person name and number and and click a picture instantly so that I can add it with invoice so that anyone cannot be fraud me. 

After that I can set it as draft. Or direct sell the product. Or add a new product button.
Then an invoice will generate and can download it directly and send it via email.

---------------------------
Locations table: 
Only admin and super admin can add a new location. 
First of all it has a name then the type like Warehouse or showroom then the full address need to submit then the capacity need to submit then manager name and his phone number. 

The UI will be very simple. In the location page there will be add button and when I click on the add and I have to submit those things 

Now if I talk about the database schema it must we have an ID location name City type like warehouses capacity manager phone status means active or not then the request transfer. 

_____
Then I have to add a transfer table 
If I search any product it will show it from the warehouse and I can make request to transfer it in my account or showroom. It can be done by the sales manager. 

_____ 
then the table of sample tracking 

Basically when we buy fabrics we have to give some company the fabrics. It is not a legal piece. It is quite big. 
So it may cost some money because we cannot sell it. We just send it as a sample if they like it they can order or they cannot.
In the sample taking we have to mention the product name from the product database it patch then the product code and it will show the total stock. Then the customer full details means when where we send two then we set the quantity and a description/note, add a cost. We have to choose the lot number so it will cost with the quantity and at the cost. Then I have to specify the delivery info when it is delivered or who is receiving it or the person will take care of it. 

If I talk about the database schema it has the ID. Product name, customer quantity description, cost info, status, deliver info and others.

Note that the cost will deduct from the overall price because it cost but we cannot get it from the customer so we have to be at the loss. 

____
Then the payment table the payment table have its ID. Seller ID, customer ID payment date payment method created by means which admin, super admin or the manager makes it. But there can be many more feature on the payment table 
__

Then the activity log table.
The activity log table will show according to the role based. 
First of all, the super admin and admin can see all of the changes made by the users. In overall, any little changes can be stored on the activity log. 
But if I talk about the sales manager they can only see its specific Warehouse or showroom. They cannot see the overall activity log because they don't have the permission. 

The log, It will store everything on the database. User ID action module entity type entity name description details timestamp credit money debited money or any little changes can store on the activity log table.
--------------------------------

Then the report table. 
There can be multiple way to store the reports. 
First of all there will be a general report of invoice means invoicing. It will make or generate invoice according to the product and store. 
Then other reports are like you can download the overall performance report by monthly yearly or specific date to date. We can download The activity log. We can download the ok overall revenue welcome sales, customer list top customers all sales report. Any kind of report that is infactful for this business just adds it. 

----------------
You have to add the settings table. 
It will need to store all of the settings needed work this project. 



--------------
Lastly, add the remaining table name with their schemas so that I can understand the overall project. So if anything I missed I can review it and add it to my projects database.

