/**
 * 1. after successful login: generate a jwt token
 * npm i jsonwebtoken, cookie-parser
 * jwt.sign(payload, secret, {expiresIn: '1d'})
 * 
 * 
 * 2. send token (generated in the server side) to the client side
 * local storage --> easier 
 * 
 * httpOnly cookies ---> better
 * 
 * 
 * 3. for sensitive or secure or private or protected apis: send token to the server side
 * 
 * on the server side: 
 * app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
 * 

in the client side: 
 use axios get , post, delete, patch for secure apis and must use: {withCredentials: true}
 * 
 * 4. validate the token in the server side: 
 * if valid: provide data
 * if not valid: logout
 * 
 * 5. check right user accessing his/her own data based on permission
 * 
 * 
 * 
*/


/**
 * ------------------------
 *          JWT          
 * ------------------------
 * 
 * install jsonwebtoken cookie-parser
 * set cookieParser as middleware
 * 
 * 1. create a token
 * 
 * jwt.sign(data, secret, {expiresIn: '5h'})
 * 
 * set token to the cookie of res.cookie('token', token, {
 *      httpOnly: true,
 *      secure: false
 * }).send({})
 * 
 * cors({
 *  origin: [''],
 *   credentials: true
 * })
 * 
 * client: {
 *  withCredentials: true
 * }
 * 
 * 2. send the token to the client side. make sure token is in the cookies (application)
 * 
 * 3. 
 * 
 * 
*/