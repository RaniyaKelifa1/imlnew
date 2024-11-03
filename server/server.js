const express = require('express');
const odbc = require('odbc');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); 

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

// ODBC connection string
const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\dev;Database=imsbmp1;Trusted_Connection=yes;';

// Function to execute a query
async function executeQuery(query, params = []) {
    let connection;
    try {
        connection = await odbc.connect(connectionString);
        const result = await connection.query(query, params);
        await connection.close();
        return result;
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    }
}

// CRUD Operations for Address

// Get all addresses
app.get('/addresses', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM Address');
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Get an address by ID
app.get('/addresses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM Address WHERE AddressID = ?', [id]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.json(results[0]);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/addresses', async (req, res) => {
    const { City, Subcity, HouseNo, Wereda } = req.body;
    console.log(typeof(City))
    try {
        await executeQuery('INSERT INTO Address (City, Subcity, HouseNo, Wereda) VALUES (?, ?, ?, ?)', [City, Subcity, HouseNo, Wereda]);
        const result = await executeQuery('SELECT SCOPE_IDENTITY() AS AddressID');
        res.status(201).json({ AddressID: result[0].AddressID });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});




// Update an address by ID
app.put('/addresses/:id', async (req, res) => {
    const { id } = req.params;
    const { City, Subcity, HouseNo, Wereda } = req.body;
    try {
        const result = await executeQuery('UPDATE Address SET City = ?, Subcity = ?, HouseNo = ?, Wereda = ? WHERE AddressID = ?', [City, Subcity, HouseNo, Wereda, id]);
        if (result.count === 0) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.json({ message: 'Address updated successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete an address by ID
app.delete('/addresses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await executeQuery('DELETE FROM Address WHERE AddressID = ?', [id]);
        if (result.count === 0) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.json({ message: 'Address deleted successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});


// ============================
// CRUD Operations for PersonType
// ============================

// Get all person types
app.get('/persontypes', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM PersonType');
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Get a person type by ID
app.get('/persontypes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM PersonType WHERE PersonTypeID = ?', [id]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).send(err);
    }
});


// Create a new person type
app.post('/persontypes', async (req, res) => {
    const { TypeName } = req.body; // Access TypeName from req.body
    console.log(typeof(TypeName)); // Optional: Debug the type of TypeName

    try {
        // Execute the insert query
        await executeQuery('INSERT INTO PersonType (Ptype) VALUES (?)', [TypeName]);

        // Get the last inserted ID
        const result = await executeQuery('SELECT SCOPE_IDENTITY() AS PersonTypeID');
        res.status(201).json({ PersonTypeID: result[0].PersonTypeID });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
    
});

// Update a person type by ID
app.put('/persontypes/:id', async (req, res) => {
    const { id } = req.params;
    const { TypeName } = req.body;
    try {
        await executeQuery('UPDATE PersonType SET TypeName = ? WHERE PersonTypeID = ?', 
        [TypeName, id]);
        res.json({ message: 'PersonType updated successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete a person type by ID
app.delete('/persontypes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await executeQuery('DELETE FROM PersonType WHERE PersonTypeID = ?', [id]);
        res.json({ message: 'PersonType deleted successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});

// ============================
// CRUD Operations for OrganizationType
// ============================

// Get all organization types
app.get('/organizationtypes', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM OrganizationType');
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Get an organization type by ID
app.get('/organizationtypes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM OrganizationType WHERE OrganizationTypeID = ?', [id]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Create a new organization type
app.post('/organizationtypes', async (req, res) => {
    const { TypeName } = req.body; // Access TypeName from req.body
    console.log(typeof(TypeName)); // Optional: Debug the type of TypeName

    try {
        // Execute the insert query
        await executeQuery('INSERT INTO OrganizationType (Ptype) VALUES (?)', [TypeName]);

        // Get the last inserted ID
        const result = await executeQuery('SELECT SCOPE_IDENTITY() AS OrganizationTypeID');
        res.status(201).json({ OrganizationTypeID: result[0].OrganizationTypeID });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
    
});

// Update an organization type by ID
app.put('/organizationtypes/:id', async (req, res) => {
    const { id } = req.params;
    const { TypeName } = req.body;
    try {
        await executeQuery('UPDATE OrganizationType SET TypeName = ? WHERE OrganizationTypeID = ?', 
        [TypeName, id]);
        res.json({ message: 'OrganizationType updated successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete an organization type by ID
app.delete('/organizationtypes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await executeQuery('DELETE FROM OrganizationType WHERE OrganizationTypeID = ?', [id]);
        res.json({ message: 'OrganizationType deleted successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});

// ============================
// CRUD Operations for InsurableObject
// ============================

// Get all insurable objects
app.get('/insurableobjects', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM InsurableObject');
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Get an insurable object by ID
app.get('/insurableobjects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM InsurableObject WHERE InsurableObjectID = ?', [id]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Create a new insurable object
app.post('/insurableobjects', async (req, res) => {
    const {  ObjectID,  PolicyID ,ObjectType} = req.body;
    const InsurableObjectID = uuidv4().replace(/-/g, '').substring(0, 10);  // Generate unique InsurableObjectID
    try {
        await executeQuery('INSERT INTO InsurableObject (InsurableObjectID,  ObjectID,  ObjectType, PolicyID) VALUES (?,?, ?, ?)', 
        [InsurableObjectID, ObjectID,ObjectType, PolicyID]);
        res.status(201).json({ id: InsurableObjectID });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Update an insurable object by ID
app.put('/insurableobjects/:id', async (req, res) => {
    const { id } = req.params;
    const { ObjectName, ObjectType } = req.body;
    try {
        await executeQuery('UPDATE InsurableObject SET ObjectName = ?, ObjectType = ? WHERE InsurableObjectID = ?', 
        [ObjectName, ObjectType, id]);
        res.json({ message: 'InsurableObject updated successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete an insurable object by ID
app.delete('/insurableobjects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await executeQuery('DELETE FROM InsurableObject WHERE InsurableObjectID = ?', [id]);
        res.json({ message: 'InsurableObject deleted successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});

// ============================
// CRUD Operations for InsurancePolicyType
// ============================

// Get all insurance policy types
app.get('/insurancepolicytypes', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM InsurancePolicyType');
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Get an insurance policy type by ID
app.get('/insurancepolicytypes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM InsurancePolicyType WHERE InsurancePolicyTypeID = ?', [id]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Create a new insurance policy type
app.post('/insurancepolicytypes', async (req, res) => {
    const { TypeName } = req.body;
    const InsurancePolicyTypeID = uuidv4(); // Generate unique InsurancePolicyTypeID
    try {
        await executeQuery('INSERT INTO InsurancePolicyType (InsurancePolicyTypeID, TypeName) VALUES (?, ?)', 
        [InsurancePolicyTypeID, TypeName]);
        res.status(201).json({ id: InsurancePolicyTypeID });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Update an insurance policy type by ID
app.put('/insurancepolicytypes/:id', async (req, res) => {
    const { id } = req.params;
    const { TypeName } = req.body;
    try {
        await executeQuery('UPDATE InsurancePolicyType SET TypeName = ? WHERE InsurancePolicyTypeID = ?', 
        [TypeName, id]);
        res.json({ message: 'InsurancePolicyType updated successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete an insurance policy type by ID
app.delete('/insurancepolicytypes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await executeQuery('DELETE FROM InsurancePolicyType WHERE InsurancePolicyTypeID = ?', [id]);
        res.json({ message: 'InsurancePolicyType deleted successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});
// ============================
// CRUD Operations for Client
// ============================

// Get all clients

app.post('/persons', async (req, res) => {
    const { FirstName, LastName, PhoneNumber, Email, PersonTypeID, NationalIDNo, AddressID } = req.body;
    const PersonID = uuidv4().replace(/-/g, '').substring(0, 10); // Generate unique PersonID
    const ClientID = uuidv4().replace(/-/g, '').substring(0, 10); // Generate unique ClientID
    console.log('Generated PersonID:', PersonID);
    console.log('Generated ClientID:', ClientID);
    console.log(req.body);
    const Name = `${FirstName} ${LastName}`;
    try {
        // Insert into Person table
        await executeQuery(
            'INSERT INTO Person (PersonID, FirstName, LastName, Name, PhoneNumber, Email, PersonTypeID, NationalIDNo, AddressID) VALUES (?, ?, ?,?, ?, ?, ?, ?, ?)', 
            [PersonID, FirstName, LastName,Name, PhoneNumber, Email, PersonTypeID, NationalIDNo, AddressID]
        );

        // Insert into Client table
        const clientData = {
            ClientType: 'Person',
            PersonID: PersonID,
            OrganizationID: null, // Setting OrganizationID to null
            ClientID: ClientID // Include the generated ClientID
        };

        await executeQuery(
            'INSERT INTO Client (ClientID, ClientType, PersonID, OrganizationID) VALUES (?, ?, ?, ?)', 
            [clientData.ClientID, clientData.ClientType, clientData.PersonID, clientData.OrganizationID]
        );

        res.status(201).json({ id: PersonID });
    } catch (err) {
        console.error('Error adding contact person or client:', err);
        res.status(500).json({ message: 'An error occurred while adding the contact person and client.' });
    }
});

// Update a person by ID
app.put('/persons/:id', async (req, res) => {
    const { id } = req.params;
    const { FirstName, LastName, DateOfBirth, Gender, Address, PhoneNumber, Email } = req.body;
    try {
        await executeQuery('UPDATE Person SET FirstName = ?, LastName = ?, DateOfBirth = ?, Gender = ?, Address = ?, PhoneNumber = ?, Email = ? WHERE PersonID = ?', 
        [FirstName, LastName, DateOfBirth, Gender, Address, PhoneNumber, Email, id]);
        res.json({ message: 'Person updated successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete a person by ID
app.delete('/persons/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await executeQuery('DELETE FROM Person WHERE PersonID = ?', [id]);
        res.json({ message: 'Person deleted successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});
app.get('/Persons', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM Person');
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});
// Create Insurance Company
app.post('/insurance-companies', async (req, res) => {
    const { CompanyName, PhoneNumber, Email, AddressID } = req.body;
    const CompanyID = uuidv4().replace(/-/g, '').substring(0, 10); // Generate unique CompanyID

    try {
        await executeQuery(
            'INSERT INTO InsuranceCompany (CompanyID, CompanyName, PhoneNumber, Email, AddressID) VALUES (?, ?, ?, ?, ?)', 
            [CompanyID, CompanyName, PhoneNumber, Email, AddressID]
        );
        res.status(201).json({ id: CompanyID }); // Return the new company's ID
    } catch (err) {
        console.error('Error adding insurance company:', err);
        res.status(500).json({ message: 'Failed to add insurance company' });
    }
});

// Read All Insurance Companies
app.get('/insurance-companies', async (req, res) => {
    try {
        const companies = await executeQuery('SELECT * FROM InsuranceCompany');
        res.status(200).json(companies);
    } catch (err) {
        console.error('Error fetching insurance companies:', err);
        res.status(500).json({ message: 'Failed to fetch insurance companies' });
    }
});

// Read a Single Insurance Company by ID
app.get('/insurance-companies/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const company = await executeQuery('SELECT * FROM InsuranceCompany WHERE CompanyID = ?', [id]);
        
        if (company.length === 0) {
            return res.status(404).json({ message: 'Insurance company not found' });
        }
        
        res.status(200).json(company[0]);
    } catch (err) {
        console.error('Error fetching insurance company:', err);
        res.status(500).json({ message: 'Failed to fetch insurance company' });
    }
});

// Update an Insurance Company
app.put('/insurance-companies/:id', async (req, res) => {
    const { id } = req.params;
    const { CompanyName, PhoneNumber, Email, AddressID } = req.body;

    try {
        const result = await executeQuery(
            'UPDATE InsuranceCompany SET CompanyName = ?, PhoneNumber = ?, Email = ?, AddressID = ? WHERE CompanyID = ?', 
            [CompanyName, PhoneNumber, Email, AddressID, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Insurance company not found' });
        }

        res.status(200).json({ message: 'Insurance company updated successfully' });
    } catch (err) {
        console.error('Error updating insurance company:', err);
        res.status(500).json({ message: 'Failed to update insurance company' });
    }
});

// Delete an Insurance Company
app.delete('/insurance-companies/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await executeQuery('DELETE FROM InsuranceCompany WHERE CompanyID = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Insurance company not found' });
        }

        res.status(200).json({ message: 'Insurance company deleted successfully' });
    } catch (err) {
        console.error('Error deleting insurance company:', err);
        res.status(500).json({ message: 'Failed to delete insurance company' });
    }
});

// ============================
// CRUD Operations for Organization
// ============================

// Get all organizations
app.get('/organizations', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM Organization');
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Get an organization by ID
app.get('/organizations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM Organization WHERE OrganizationID = ?', [id]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/organizations', async (req, res) => {
    const { Name, PhoneNumber, Email, OrganizationTypeID, TINNo, AddressID, PersonID } = req.body;
    const OrganizationID = uuidv4().replace(/-/g, '').substring(0, 10); // Generate unique OrganizationID
    const ClientID = uuidv4().replace(/-/g, '').substring(0, 10); // Generate unique ClientID
    console.log(req.body);
    console.log('Generated OrganizationID:', OrganizationID);
    console.log('Generated ClientID:', ClientID);

    try {
        // If PersonID is null or empty, handle it
        const personIdValue = PersonID ? PersonID : null;
        
        // Insert into Organization table
        await executeQuery(
            'INSERT INTO Organization (OrganizationID, Name, PhoneNumber, Email, OrganizationTypeID, TINNo, AddressID, PersonID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [OrganizationID, Name, PhoneNumber, Email, OrganizationTypeID, TINNo, AddressID, personIdValue]
        );

        // Insert into Client table for organization
        const clientData = {
            ClientType: 'Organization',
            OrganizationID: OrganizationID,
            PersonID: null ,// Can be null if not provided
            ClientID: ClientID // Include the generated ClientID
        };

        await executeQuery(
            'INSERT INTO Client (ClientID, ClientType, OrganizationID, PersonID) VALUES (?, ?, ?, ?)', 
            [clientData.ClientID, clientData.ClientType, clientData.OrganizationID, clientData.PersonID]
        );
        
        res.status(201).json({ id: OrganizationID }); // Return the new organization's ID
    } catch (err) {
        console.error('Error adding organization:', err);
        res.status(500).json({ message: 'Failed to add organization and client.' }); // Handle errors
    }
});


// Update an organization by ID
app.put('/organizations/:id', async (req, res) => {
    const { id } = req.params;
    const { Name, Address, PhoneNumber, Email } = req.body;
    try {
        await executeQuery('UPDATE Organization SET Name = ?, Address = ?, PhoneNumber = ?, Email = ? WHERE OrganizationID = ?', 
        [Name, Address, PhoneNumber, Email, id]);
        res.json({ message: 'Organization updated successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete an organization by ID
app.delete('/organizations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await executeQuery('DELETE FROM Organization WHERE OrganizationID = ?', [id]);
        res.json({ message: 'Organization deleted successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/clients', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM Client');
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Get a client by ID
app.get('/clients/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM Client WHERE ClientID = ?', [id]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Create a new client
app.post('/clients', async (req, res) => {
    const { ClientType, PersonID, OrganizationID } = req.body;
    const ClientID =  uuidv4().replace(/-/g, '').substring(0, 10);
    console.log(req.body)
    try {
        await executeQuery('INSERT INTO Client (ClientID, ClientType, PersonID, OrganizationID) VALUES (?, ?, ?, ?)', 
        [ClientID, ClientType, PersonID, OrganizationID]);
        res.status(201).json({ id: ClientID });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Update a client by ID
app.put('/clients/:id', async (req, res) => {
    const { id } = req.params;
    const { ClientType, PersonID, OrganizationID } = req.body;
    try {
        const result = await executeQuery('UPDATE Client SET ClientType = ?, PersonID = ?, OrganizationID = ? WHERE ClientID = ?', 
        [ClientType, PersonID, OrganizationID, id]);
        res.json({ affectedRows: result.affectedRows });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete a client by ID
app.delete('/clients/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await executeQuery('DELETE FROM Client WHERE ClientID = ?', [id]);
        res.json({ affectedRows: result.affectedRows });
    } catch (err) {
        res.status(500).send(err);
    }
});

// ============================
// CRUD Operations for InsurancePolicy
// ============================

// Get all insurance policies
app.get('/policies', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM InsurancePolicy');
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Get a policy by ID
app.get('/policies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM InsurancePolicy WHERE PolicyID = ?', [id]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).send(err);
    }
});
app.get('/persons', async (req, res) => {
    const personId = req.query.PersonID;
    try {
      const personData = await Person.find({ PersonID: personId }); // Example using Mongoose
      res.json(personData);
    } catch (error) {
      res.status(500).send('Server error');
    }
  });
  
app.post('/policies', async (req, res) => { 
    const { PolicyNo, PolicyType, Premium, Commission,  GeographicalArea, PeriodStart, PeriodEnd, RenewalDate, PolicyStatus, CreatedBy, CreatedOn, ClientID, CompanyID, Branch, VehicleID,ExternalPolicyNo,objectTypes } = req.body;
    const PolicyID = uuidv4().replace(/-/g, '').substring(0, 10); // Generate a unique PolicyID
    const ObjectID = VehicleID; // Assuming VehicleID is the ObjectID
    const InsurableObjectID = uuidv4().replace(/-/g, '').substring(0, 10); 
    try {
        // SQL query to insert a new policy into the InsurancePolicy table
        await executeQuery(
            'INSERT INTO InsurancePolicy (PolicyID, PolicyNo, PolicyType, Premium, Commission,  GeographicalArea, PeriodStart, PeriodEnd, RenewalDate, PolicyStatus, CreatedBy, CreatedOn, ClientID, CompanyID, Branch,ExternalPolicyNo) VALUES (?,?, ?, ?,  ?,?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?)', 
            [PolicyID, PolicyNo, PolicyType, Premium,Commission,GeographicalArea, PeriodStart, PeriodEnd, RenewalDate, PolicyStatus, CreatedBy, CreatedOn, ClientID, CompanyID, Branch,ExternalPolicyNo]
        );

        // SQL query to link the PolicyID with the ObjectID (VehicleID)
        await executeQuery(
            'INSERT INTO InsurableObject (InsurableObjectID,ObjectType, PolicyID, ObjectID) VALUES (?, ?,?, ?)', 
            [InsurableObjectID,objectTypes, PolicyID, ObjectID]
        );

        res.status(201).json({ id: PolicyID });
    } catch (err) {
        console.error(err); // Log error for debugging
        res.status(500).send('Error inserting policy');
    }
});


// Update a policy by ID
app.put('/policies/:id', async (req, res) => {
    const { id } = req.params;
    const { PolicyNo, PolicyType, NameOfInsured, Premium, SumInsured, PeriodStart, PeriodEnd, RenewalDate, PolicyStatus, CreatedBy, CreatedOn, IsDeleted, InsurableObjectID, ClientID } = req.body;
    try {
        const result = await executeQuery('UPDATE InsurancePolicy SET PolicyNo = ?, PolicyType = ?, NameOfInsured = ?, Premium = ?, SumInsured = ?, PeriodStart = ?, PeriodEnd = ?, RenewalDate = ?, PolicyStatus = ?, CreatedBy = ?, CreatedOn = ?, IsDeleted = ?, InsurableObjectID = ?, ClientID = ? WHERE PolicyID = ?', 
        [PolicyNo, PolicyType, NameOfInsured, Premium, SumInsured, PeriodStart, PeriodEnd, RenewalDate, PolicyStatus, CreatedBy, CreatedOn, IsDeleted, InsurableObjectID, ClientID, id]);
        res.json({ affectedRows: result.affectedRows });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete a policy by ID
app.delete('/policies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await executeQuery('DELETE FROM InsurancePolicy WHERE PolicyID = ?', [id]);
        res.json({ affectedRows: result.affectedRows });
    } catch (err) {
        res.status(500).send(err);
    }
});

// ============================
// CRUD Operations for Vehicle
// ============================
// CREATE: Add a new Workmen's Compensation record
app.post('/WorkmenCompensation', async (req, res) => {
    const { salary, assistantSalary, remark, vehicleID } = req.body;

    try {
        // Insert a new Workmen's Compensation record
        await executeQuery(
            'INSERT INTO WorkmensCompensation (Salary, AssistantSalary, Remark, VehicleID) VALUES (?, ?, ?, ?)', 
            [salary, assistantSalary, remark, vehicleID]
        );
        res.status(201).json({ message: 'Workmen\'s Compensation added successfully' });
    } catch (error) {
        console.error('Error inserting Workmen\'s Compensation:', error); // Log error for debugging
        res.status(500).send('Error adding Workmen\'s Compensation record');
    }
});

// READ: Get all Workmen's Compensation records or by VehicleID
app.get('/WorkmenCompensation', async (req, res) => {
    const { vehicleID } = req.query;
    let query = 'SELECT * FROM WorkmensCompensation';
    const params = [];

    if (vehicleID) {
        query += ' WHERE VehicleID = ?';
        params.push(vehicleID);
    }

    try {
        const results = await executeQuery(query, params);
        res.json(results);
    } catch (error) {
        console.error('Error fetching Workmen\'s Compensation records:', error);
        res.status(500).send('Error fetching records');
    }
});

// UPDATE: Update an existing Workmen's Compensation record by CompensationID
app.put('/WorkmenCompensation/:id', async (req, res) => {
    const { id } = req.params;
    const { salary, assistantSalary, remark, vehicleID } = req.body;

    try {
        // Update an existing Workmen's Compensation record
        const result = await executeQuery(
            'UPDATE WorkmensCompensation SET Salary = ?, AssistantSalary = ?, Remark = ?, VehicleID = ? WHERE CompensationID = ?', 
            [salary, assistantSalary, remark, vehicleID, id]
        );
        res.json({ message: 'Workmen\'s Compensation updated successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error updating Workmen\'s Compensation:', error);
        res.status(500).send('Error updating record');
    }
});

// DELETE: Remove a Workmen's Compensation record by CompensationID
app.delete('/WorkmenCompensation/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await executeQuery('DELETE FROM WorkmensCompensation WHERE CompensationID = ?', [id]);
        res.json({ message: 'Workmen\'s Compensation deleted successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error deleting Workmen\'s Compensation:', error);
        res.status(500).send('Error deleting record');
    }
});

// READ: Get a Workmen's Compensation record by CompensationID
app.get('/WorkmenCompensation/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await executeQuery('SELECT * FROM WorkmensCompensation WHERE CompensationID = ?', [id]);
        
        // Check if the record exists
        if (result.length === 0) {
            return res.status(404).send('Workmen\'s Compensation record not found');
        }

        res.json(result[0]); // Return the found record
    } catch (error) {
        console.error('Error fetching Workmen\'s Compensation record:', error);
        res.status(500).send('Error fetching record');
    }
});

// Get all vehicles
app.get('/vehicles', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM Vehicle');
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Get a vehicle by ID
app.get('/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM Vehicle WHERE VehicleID = ?', [id]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).send(err);
    }
});



app.post('/vehicles', async (req, res) => {
    const { MakeAndModel, Year, BodyType, PlateNo, SerialNoOrChassisNo, Excess, SeatCapacity, SumInsured, EngineNo, UseOfVehicle, CC_HP, DutyFree } = req.body;
    const VehicleID = uuidv4().replace(/-/g, '').substring(0, 10);

    try {
        // Execute the SQL query to insert the vehicle data into the database
        await executeQuery('INSERT INTO Vehicle (VehicleID, MakeAndModel, Year, BodyType, PlateNo, SerialNoOrChassisNo, Excess, SeatCapacity, SumInsured, EngineNo, UseOfVehicle, CC_HP, DutyFree) VALUES (?, ?,  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [VehicleID, MakeAndModel, Year, BodyType, PlateNo, SerialNoOrChassisNo, Excess, SeatCapacity, SumInsured, EngineNo, UseOfVehicle, CC_HP, DutyFree,]);

        // Respond with success and the new VehicleID
        res.status(201).json({ id: VehicleID });
    } catch (err) {
        console.error('Error inserting vehicle:', err); // Log the error for debugging
        res.status(500).send('Failed to add vehicle');
    }
});


// Update a vehicle by ID
app.put('/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    const { MakeAndModel, Year, BodyType, PlateNo, SerialNoOrChassisNo, Excess, SeatCapacity, SumInsured, EngineNo, UseOfVehicle, CC_HP, DutyFree, OwnerType } = req.body;
    try {
        const result = await executeQuery('UPDATE Vehicle SET MakeAndModel = ?, Year = ?, BodyType = ?, PlateNo = ?, SerialNoOrChassisNo = ?, Excess = ?, SeatCapacity = ?, SumInsured = ?, EngineNo = ?, UseOfVehicle = ?, CC_HP = ?, DutyFree = ?, OwnerType = ? WHERE VehicleID = ?', 
        [MakeAndModel, Year, BodyType, PlateNo, SerialNoOrChassisNo, Excess, SeatCapacity, SumInsured, EngineNo, UseOfVehicle, CC_HP, DutyFree, OwnerType, id]);
        res.json({ affectedRows: result.affectedRows });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete a vehicle by ID
app.delete('/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await executeQuery('DELETE FROM Vehicle WHERE VehicleID = ?', [id]);
        res.json({ affectedRows: result.affectedRows });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
