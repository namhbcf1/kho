import products from './modules/products';
import orders from './modules/orders';
import customers from './modules/customers';
import users from './modules/users';
import financial from './modules/financial';
import suppliers from './modules/suppliers';
import reports from './modules/reports';
import warranty from './modules/warranty';

app.route('/api/products', products);
app.route('/api/orders', orders);
app.route('/api/customers', customers);
app.route('/api/users', users);
app.route('/api/financial', financial);
app.route('/api/suppliers', suppliers);
app.route('/api/reports', reports);
app.route('/api/warranty', warranty); 