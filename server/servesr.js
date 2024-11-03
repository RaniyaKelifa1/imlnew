const express = require('express');
const odbc = require('odbc');
const app = express();
const cors = require('cors');
const port = 3000;
const { v4: uuidv4 } = require('uuid'); 

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

// ODBC connection string
const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\dev;Database=imsbm;Trusted_Connection=yes;';

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




// CREATE a new Insurable Object
app.post('/insurable-objects', async (req, res) => {
    const InsurableObjectID = uuidv4(); // Automatically generate the ID
    const { ObjectType, Description } = req.body;
    console.log(req.body)
    try {
        await executeQuery(
            'INSERT INTO InsurableObject (InsurableObjectID, ObjectType, Description) VALUES (?, ?, ?)',
            [InsurableObjectID, ObjectType, Description]
        );
        res.status(201).json({ InsurableObjectID, message: 'Insurable Object created successfully!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// READ all Insurable Objects
app.get('/insurable-objects', async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM InsurableObject');
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ a single Insurable Object by ID
app.get('/insurable-objects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await executeQuery('SELECT * FROM InsurableObject WHERE InsurableObjectID = ?', [id]);
        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Insurable Object not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE an Insurable Object by ID
app.put('/insurable-objects/:id', async (req, res) => {
    const { id } = req.params;
    const { ObjectType, Description } = req.body;

    try {
        const result = await executeQuery(
            'UPDATE InsurableObject SET ObjectType = ?, Description = ? WHERE InsurableObjectID = ?',
            [ObjectType, Description, id]
        );
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Insurable Object updated successfully' });
        } else {
            res.status(404).json({ message: 'Insurable Object not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE an Insurable Object by ID
app.delete('/insurable-objects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await executeQuery('DELETE FROM InsurableObject WHERE InsurableObjectID = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(204).send(); // No content response for successful deletion
        } else {
            res.status(404).json({ message: 'Insurable Object not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/organization-types', async (req, res) => {
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

app.get('/organization-types', async (req, res) => {
  try {
      const result = await executeQuery('SELECT * FROM OrganizationType');
      res.status(200).json(result);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.get('/organization-types/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const result = await executeQuery('SELECT * FROM OrganizationType WHERE OrganizationTypeID = ?', [id]);
      result.length > 0 ? res.status(200).json(result[0]) : res.status(404).json({ message: 'OrganizationType not found' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.put('/organization-types/:id', async (req, res) => {
  const { id } = req.params;
  const { Ptype } = req.body;
  try {
      const result = await executeQuery('UPDATE OrganizationType SET Ptype = ? WHERE OrganizationTypeID = ?', [Ptype, id]);
      result.affectedRows > 0 ? res.status(200).json({ message: 'OrganizationType updated successfully' }) : res.status(404).json({ message: 'OrganizationType not found' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.delete('/organization-types/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const result = await executeQuery('DELETE FROM OrganizationType WHERE OrganizationTypeID = ?', [id]);
      result.affectedRows > 0 ? res.status(204).send() : res.status(404).json({ message: 'OrganizationType not found' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// CRUD for PersonType
app.post('/person-types', async (req, res) => {
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

app.get('/person-types', async (req, res) => {
  try {
      const result = await executeQuery('SELECT * FROM PersonType');
      res.status(200).json(result);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.get('/person-types/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const result = await executeQuery('SELECT * FROM PersonType WHERE PersonTypeID = ?', [id]);
      result.length > 0 ? res.status(200).json(result[0]) : res.status(404).json({ message: 'PersonType not found' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.put('/person-types/:id', async (req, res) => {
  const { id } = req.params;
  const { Ptype } = req.body;
  try {
      const result = await executeQuery('UPDATE PersonType SET Ptype = ? WHERE PersonTypeID = ?', [Ptype, id]);
      result.affectedRows > 0 ? res.status(200).json({ message: 'PersonType updated successfully' }) : res.status(404).json({ message: 'PersonType not found' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.delete('/person-types/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const result = await executeQuery('DELETE FROM PersonType WHERE PersonTypeID = ?', [id]);
      result.affectedRows > 0 ? res.status(204).send() : res.status(404).json({ message: 'PersonType not found' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


app.post('/persons', async (req, res) => {
  const PersonID = uuidv4(); // Generate a new UUID for PersonID
  const ClientID = uuidv4();
  const { FirstName, LastName, PhoneNumber, Email, PersonTypeID, NationalIDNo, AddressID, OrganizationID } = req.body;

  // Combine FirstName and LastName to populate the 'Name' column
  const Name = `${FirstName} ${LastName}`;

  try {
    // Convert nullable fields to null if they are undefined or empty
    const personTypeIdValue = PersonTypeID ? parseInt(PersonTypeID) : null;
    const nationalIDValue = NationalIDNo ? parseInt(NationalIDNo) : null;
    const addressIdValue = AddressID ? parseInt(AddressID) : null;
    const organizationIdValue = OrganizationID ? parseInt(OrganizationID) : null;  // Ensure proper value for OrganizationID

    // Insert into Person table
    await executeQuery(
      'INSERT INTO Person (PersonID, FirstName, LastName, PhoneNumber, Email, PersonTypeID, NationalIDNo, AddressID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        PersonID,
        FirstName,
        LastName,
        PhoneNumber || null,
        Email || null,
        personTypeIdValue,
        nationalIDValue,
        addressIdValue
      ]
    );

    // Insert into Clients table
    await executeQuery(
      'INSERT INTO Clients (ClientID, PersonID, OrganizationID) VALUES (?, ?, ?)',
      [
        ClientID,
        PersonID,
        organizationIdValue  // Send null or integer, not an empty string
      ]
    );

    res.status(201).json({ PersonID, message: 'Person created successfully!' });
  } catch (error) {
    console.error('Error adding person:', error);
    res.status(400).json({ error: error.message });
  }
});

  

// READ all Persons
app.get('/persons', async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM Person');
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });
  
  // READ a single Person by ID
  app.get('/persons/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await executeQuery('SELECT * FROM Person WHERE PersonID = ?', [id]);
        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).json({ message: 'Person not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });
  
  // UPDATE a Person by ID
  app.put('/persons/:id', async (req, res) => {
    const { id } = req.params;
    const { FirstName, LastName, PhoneNumber, Email, PersonTypeID, NationalIDNo, AddressID } = req.body;
  
    // Combine FirstName and LastName for 'Name' field
    const Name = `${FirstName} ${LastName}`;
  
    try {
        const result = await executeQuery(
            'UPDATE Person SET FirstName = ?, LastName = ?, PhoneNumber = ?, Email = ?, PersonTypeID = ?, NationalIDNo = ?, AddressID = ? WHERE PersonID = ?',
            [
                FirstName, 
                LastName, 
         
                PhoneNumber || null, 
                Email || null, 
                PersonTypeID ? parseInt(PersonTypeID) : null, 
                NationalIDNo ? parseInt(NationalIDNo) : null, 
                AddressID ? parseInt(AddressID) : null, 
                id
            ]
        );
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Person updated successfully' });
        } else {
            res.status(404).json({ message: 'Person not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });
  
  // DELETE a Person by ID
  app.delete('/persons/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await executeQuery('DELETE FROM Person WHERE PersonID = ?', [id]);
        if (result.affectedRows > 0) {
            res.status(204).send(); // No content response for successful deletion
        } else {
            res.status(404).json({ message: 'Person not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  });
  app.get('/miscellaneous-objects', async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM MiscellaneousObject');
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/miscellaneous-objects', async (req, res) => {
    const MiscellaneousObjectID = uuidv4();  // Generate a UUID
    const { Description, InsurableObjectID } = req.body;

    try {
        await executeQuery(
            'INSERT INTO MiscellaneousObject (MiscellaneousObjectID, Description, InsurableObjectID) VALUES (?, ?, ?)',
            [MiscellaneousObjectID, Description, InsurableObjectID]
        );
        res.status(201).json({ MiscellaneousObjectID, message: 'Miscellaneous Object created successfully!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

  
// CRUD operations for Organization
app.post('/properties', async (req, res) => {
    const PropertyID = uuidv4(); // Automatically generate the ID
    const { Address, PropertyType, SumInsured, InsurableObjectID } = req.body;
    try {
        await executeQuery(
            'INSERT INTO Properties (PropertyID, Address, PropertyType, SumInsured,  InsurableObjectID) VALUES (?, ?,  ?, ?, ?)',
            [PropertyID, Address, PropertyType, SumInsured,InsurableObjectID]
        );
        res.status(201).json({ PropertyID, message: 'Property created successfully!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Read all properties
app.get('/properties', async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM Properties');
        res.status(200).json(result);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Failed to retrieve properties.' });
    }
});




// Read a single property by ID
app.get('/properties/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await executeQuery('SELECT * FROM Properties WHERE PropertyID = ?', [id]);
        if (result.recordset.length === 0) {
            res.status(404).json({ message: 'Property not found' });
        } else {
            res.status(200).json(result.recordset[0]);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a property by ID
app.put('/properties/:id', async (req, res) => {
    const { id } = req.params;
    const { Address, PropertyType, SumInsured,  } = req.body;
    try {
        const result = await executeQuery(
            'UPDATE Properties SET Address = ?, PropertyType = ?, SumInsured = ? WHERE PropertyID = ?',
            [Address, PropertyType, SumInsured, id]
        );
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: 'Property not found' });
        } else {
            res.status(200).json({ message: 'Property updated successfully' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a property by ID
app.delete('/properties/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await executeQuery('DELETE FROM Properties WHERE PropertyID = ?', [id]);
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: 'Property not found' });
        } else {
            res.status(200).json({ message: 'Property deleted successfully' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// CREATE a new Organization
app.post('/organizations', async (req, res) => {
  const OrganizationID = uuidv4();
  const { Name, PhoneNumber, Email, OrganizationTypeID, TINNo, AddressID } = req.body;

  console.log(typeof(Email))
  console.log(typeof(PhoneNumber))
  try {
      await executeQuery(
          'INSERT INTO Organization (OrganizationID, Name, PhoneNumber, Email,  OrganizationTypeID, TINNo, AddressID) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [OrganizationID, Name, PhoneNumber, Email,  OrganizationTypeID, TINNo, AddressID]
      );
      res.status(201).json({ OrganizationID, message: 'Organization created successfully!' });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
});

// READ all Organizations
app.get('/organizations', async (req, res) => {
  try {
      const result = await executeQuery('SELECT * FROM Organization');
      res.status(200).json(result);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// READ a single Organization by ID
app.get('/organizations/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const result = await executeQuery('SELECT * FROM Organization WHERE OrganizationID = ?', [id]);
      if (result.length > 0) {
          res.status(200).json(result[0]);
      } else {
          res.status(404).json({ message: 'Organization not found' });
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// UPDATE an Organization by ID
app.put('/organizations/:id', async (req, res) => {
  const { id } = req.params;
  const { Name, PhoneNumber, Email, OrganizationType, OrganizationTypeID, TINNo, AddressID } = req.body;
  
  try {
      const result = await executeQuery(
          'UPDATE Organization SET Name = ?, PhoneNumber = ?, Email = ?, OrganizationType = ?, OrganizationTypeID = ?, TINNo = ?, AddressID = ? WHERE OrganizationID = ?',
          [Name, PhoneNumber, Email, OrganizationType, OrganizationTypeID, TINNo, AddressID, id]
      );
      if (result.affectedRows > 0) {
          res.status(200).json({ message: 'Organization updated successfully' });
      } else {
          res.status(404).json({ message: 'Organization not found' });
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// DELETE an Organization by ID
app.delete('/organizations/:id', async (req, res) => {

  const { id } = req.params;
  console.log(req.params)
  try {
      const result = await executeQuery('DELETE FROM Organization WHERE OrganizationID = ?', [id]);
      if (result.affectedRows > 0) {
          res.status(204).send(); // No content response for successful deletion
      } else {
          res.status(404).json({ message: 'Organization not found' });
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
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

app.get('/addresses', async (req, res) => {
  try {
      const result = await executeQuery('SELECT * FROM Address');
      res.status(200).json(result);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.get('/addresses/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const result = await executeQuery('SELECT * FROM Address WHERE AddressID = ?', [id]);
      result.length > 0 ? res.status(200).json(result[0]) : res.status(404).json({ message: 'Address not found' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.put('/addresses/:id', async (req, res) => {
    const { id } = req.params;
    const { City, Subcity, HouseNo, Wereda } = req.body;
    console.log('Request Body:', req.body);
    console.log('Request Params:', req.params);
  
    try {
      const result = await executeQuery('UPDATE Address SET City = ?, Subcity = ?, HouseNo = ?, Wereda = ? WHERE AddressID = ?', [City, Subcity, HouseNo, Wereda, id]);
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Address updated successfully' });
      } else {
        res.status(404).json({ message: 'Address not found' });
      }
    } catch (error) {
      console.error('Error updating address:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  

app.delete('/addresses/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const result = await executeQuery('DELETE FROM Address WHERE AddressID = ?', [id]);
      result.affectedRows > 0 ? res.status(204).send() : res.status(404).json({ message: 'Address not found' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
  
  app.post('/life-objects', async (req, res) => {
    const LifeObjectID = uuidv4();
    const { InsurableObjectID, NameOfInsured, DateOfBirth, Gender, Occupation, BeneficiaryName, BeneficiaryRelation, HealthCondition, MedicalHistory, AdditionalCoverage, PolicyTerms, Exclusions } = req.body;
  console.log(req.body)
    try {
      await executeQuery(
        'INSERT INTO LifeObjects (LifeObjectID, InsurableObjectID, NameOfInsured, DateOfBirth, Gender, Occupation, BeneficiaryName, BeneficiaryRelation, HealthCondition, MedicalHistory, AdditionalCoverage, PolicyTerms, Exclusions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [LifeObjectID, InsurableObjectID, NameOfInsured, DateOfBirth, Gender, Occupation, BeneficiaryName, BeneficiaryRelation, HealthCondition, MedicalHistory, AdditionalCoverage, PolicyTerms, Exclusions]
      );
      res.status(201).json({ LifeObjectID, message: 'Life Object created successfully!' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // READ: Get all life objects
  app.get('/life-objects', async (req, res) => {
    try {
      const results = await executeQuery('SELECT * FROM LifeObjects');
      res.status(200).json(results);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // READ: Get a single life object by ID
  app.get('/life-objects/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const results = await executeQuery('SELECT * FROM LifeObjects WHERE LifeObjectID = ?', [id]);
      if (results.length === 0) {
        return res.status(404).json({ message: 'Life Object not found' });
      }
      res.status(200).json(results[0]);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // UPDATE: Update a life object
// Update Life Object
app.put('/life-objects/:id', async (req, res) => {
    const { id } = req.params;
    const { NameOfInsured, DateOfBirth, Gender, Occupation, BeneficiaryName, BeneficiaryRelation, HealthCondition, MedicalHistory, AdditionalCoverage, PolicyTerms, Exclusions } = req.body;

    console.log('Request Params:', id);
    console.log('Request Body:', { NameOfInsured, DateOfBirth, Gender, Occupation, BeneficiaryName, BeneficiaryRelation, HealthCondition, MedicalHistory, AdditionalCoverage, PolicyTerms, Exclusions });

    try {
        const query = 'UPDATE LifeObjects SET NameOfInsured = ?, DateOfBirth = ?, Gender = ?, Occupation = ?, BeneficiaryName = ?, BeneficiaryRelation = ?, HealthCondition = ?, MedicalHistory = ?, AdditionalCoverage = ?, PolicyTerms = ?, Exclusions = ? WHERE LifeObjectID = ?';
        const params = [NameOfInsured, DateOfBirth, Gender, Occupation, BeneficiaryName, BeneficiaryRelation, HealthCondition, MedicalHistory, AdditionalCoverage, PolicyTerms, Exclusions, id];
        
        console.log('Executing Query:', query);
        console.log('With Parameters:', params);

        const result = await executeQuery(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Life Object not found' });
        }

        res.status(200).json({ message: 'Life Object updated successfully!' });
    } catch (error) {
        console.error('Error executing update:', error);
        res.status(400).json({ error: error.message });
    }
});

  
  // DELETE: Delete a life object
  app.delete('/life-objects/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await executeQuery('DELETE FROM LifeObjects WHERE LifeObjectID = ?', [id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Life Object not found' });
      }
  
      res.status(200).json({ message: 'Life Object deleted successfully!' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app.post('/machineries', async (req, res) => {
    const MachineryID = uuidv4(); // Automatically generate the ID
    const { MakeAndModel, Year, SerialNoOrChassisNo, SumInsured, Usage, InsurableObjectID } = req.body;
console.log(req.body)
    try {
        await executeQuery(
            'INSERT INTO Machinery (MachineryID, MakeAndModel, Year, SerialNoOrChassisNo, SumInsured, Usage, InsurableObjectID) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [MachineryID, MakeAndModel, Year, SerialNoOrChassisNo, SumInsured, Usage, InsurableObjectID]
        );
        res.status(201).json({ MachineryID, message: 'Machinery created successfully!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.post('/bond-details', async (req, res) => {
    const BondDetailID = uuidv4();
    const { BondID, BondNumber, Description, DateOfBond, AdditionalInfo, InsurableObjectID } = req.body;
    console.log(req.body)
    try {
        await executeQuery(
        'INSERT INTO BondDetails (BondDetailID, BondID, BondNumber, Description, DateOfBond, AdditionalInfo, InsurableObjectID) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [BondDetailID, BondID, BondNumber, Description, DateOfBond, AdditionalInfo, InsurableObjectID]
      );
      res.status(201).json({ BondDetailID, message: 'Bond Detail created successfully!' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get all BondDetails
  app.get('/bond-details', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM BondDetails');
      res.status(200).json(rows);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get BondDetail by ID
  app.get('/bond-details/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await pool.query('SELECT * FROM BondDetails WHERE BondDetailID = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Bond Detail not found' });
      }
      res.status(200).json(rows[0]);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Update BondDetail
  app.put('/bond-details/:id', async (req, res) => {
    const { id } = req.params;
    const { BondID, BondNumber, Description, DateOfBond, AdditionalInfo, InsurableObjectID } = req.body;
    
    try {
      const [result] = await pool.query(
        'UPDATE BondDetails SET BondID = ?, BondNumber = ?, Description = ?, DateOfBond = ?, AdditionalInfo = ?, InsurableObjectID = ? WHERE BondDetailID = ?',
        [BondID, BondNumber, Description, DateOfBond, AdditionalInfo, InsurableObjectID, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Bond Detail not found' });
      }
      res.status(200).json({ message: 'Bond Detail updated successfully!' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Delete BondDetail
  app.delete('/bond-details/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const [result] = await pool.query('DELETE FROM BondDetails WHERE BondDetailID = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Bond Detail not found' });
      }
      res.status(200).json({ message: 'Bond Detail deleted successfully!' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
// Read all Machineries
app.get('/machineries', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM Machinery');
        res.status(200).json(results);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Read single Machinery
app.get('/machineries/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM Machinery WHERE MachineryID = ?', [id]);
        if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(404).json({ message: 'Machinery not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update Machinery
app.put('/machineries/:id', async (req, res) => {
    const { id } = req.params;
    const { MakeAndModel, Year, SerialNoOrChassisNo, SumInsured, Usage } = req.body;

    console.log('Request Params:', id);
    console.log('Request Body:', { MakeAndModel, Year, SerialNoOrChassisNo, SumInsured, Usage });

    try {
        const query = 'UPDATE Machinery SET MakeAndModel = ?, Year = ?, SerialNoOrChassisNo = ?, SumInsured = ?, Usage = ? WHERE MachineryID = ?';
        const params = [MakeAndModel, Year, SerialNoOrChassisNo, SumInsured, Usage, id];
        
        console.log('Executing Query:', query);
        console.log('With Parameters:', params);

        await executeQuery(query, params);
        res.status(200).json({ message: 'Machinery updated successfully!' });
    } catch (error) {
        console.error('Error executing update:', error);
        res.status(400).json({ error: error.message });
    }
});


// Delete Machinery
app.delete('/machineries/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await executeQuery('DELETE FROM Machinery WHERE MachineryID = ?', [id]);
        res.status(200).json({ message: 'Machinery deleted successfully!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/vehicles', async (req, res) => {
    const VehicleID = uuidv4()
    const {
        MakeAndModel,
        Year,
        BodyType,
        PlateNo,
        SerialNoOrChassisNo,
        Excess,
        SeatCapacity,
        SumInsured,
        EngineNo,
        UseOfVehicle,
        CC_HP,
        DutyFree,
  OwnerType,
        InsurableObjectID
    } = req.body;
console.log(req.body)
    try {
        const result = await executeQuery(
            'INSERT INTO Vehicles (VehicleID, MakeAndModel, Year, BodyType, PlateNo, SerialNoOrChassisNo, Excess, SeatCapacity, SumInsured, EngineNo, UseOfVehicle, CC_HP, DutyFree, OwnerType,  InsurableObjectID) VALUES (?,?, ?, ?, ?,  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [VehicleID, MakeAndModel, Year, BodyType, PlateNo, SerialNoOrChassisNo, Excess, SeatCapacity, SumInsured, EngineNo, UseOfVehicle, CC_HP, DutyFree, OwnerType, InsurableObjectID]
        );
     // Fetch last inserted ID for MySQL

        res.status(201).json({ VehicleID, message: 'Vehicle created successfully!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


app.get('/vehicles', async (req, res) => {
    try {
        const result = await executeQuery('SELECT VehicleID, MakeAndModel, Year, BodyType, PlateNo, SerialNoOrChassisNo, Excess, SeatCapacity, SumInsured, EngineNo, UseOfVehicle, CC_HP, DutyFree, OwnerType, InsurableObjectID FROM Vehicles');
        res.status(200).json(result);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Failed to retrieve vehicles.' });
    }
});

  


// Get all vehicles

// Get a specific vehicle by ID
app.get('/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await executeQuery('SELECT * FROM Vehicles WHERE VehicleID = ?', [id]);
        result.length > 0 ? res.status(200).json(result[0]) : res.status(404).json({ message: 'Vehicle not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a vehicle by ID
app.put('/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    const {
        MakeAndModel,
        Year,
        BodyType,
        PlateNo,
        SerialNoOrChassisNo,
        Excess,
        SeatCapacity,
        SumInsured,
        EngineNo,
        UseOfVehicle,
        CC_HP,
        DutyFree,
        OwnerType,
    } = req.body;
console.log(req.body)
    try {
        const result = await executeQuery(
            'UPDATE Vehicles SET MakeAndModel = ?, Year = ?, BodyType = ?, PlateNo = ?, SerialNoOrChassisNo = ?, Excess = ?, SeatCapacity = ?, SumInsured = ?, EngineNo = ?, UseOfVehicle = ?, CC_HP = ?, DutyFree = ?, OwnerType = ? WHERE VehicleID = ?',
            [MakeAndModel, Year, BodyType, PlateNo, SerialNoOrChassisNo, Excess, SeatCapacity, SumInsured, EngineNo, UseOfVehicle, CC_HP, DutyFree, OwnerType,  id]
        );
        result.affectedRows > 0 ? res.status(200).json({ message: 'Vehicle updated successfully' }) : res.status(404).json({ message: 'Vehicle not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a vehicle by ID
app.delete('/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    console.log(req.params)
    try {
        const result = await executeQuery('DELETE FROM Vehicles WHERE VehicleID = ?', [id]);
        result.affectedRows > 0 ? res.status(204).send() : res.status(404).json({ message: 'Vehicle not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/fire-lightning-insurance', async (req, res) => {
  const FireLightningInsuranceID = uuidv4(); // Generate a unique ID for FireLightningInsuranceID
  const { PolicyID, Peril } = req.body;

  try {
    const result = await executeQuery(
      'INSERT INTO FireLightningInsurance (FireLightningInsuranceID, PolicyID, Peril) VALUES (?, ?, ?)',
      [FireLightningInsuranceID, PolicyID, Peril]
    );

    res.status(201).json({ FireLightningInsuranceID, message: 'Fire Lightning Insurance created successfully!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.get('/clients', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM Clients');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve client records.' });
  }
});

// Get all Fire Lightning Insurance records
app.get('/fire-lightning-insurance', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM FireLightningInsurance');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve fire lightning insurance records.' });
  }
});

// Get a specific Fire Lightning Insurance record by ID
app.get('/fire-lightning-insurance/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await executeQuery('SELECT * FROM FireLightningInsurance WHERE FireLightningInsuranceID = ?', [id]);
    result.length > 0 ? res.status(200).json(result[0]) : res.status(404).json({ message: 'Fire Lightning Insurance not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a Fire Lightning Insurance record by ID
app.put('/fire-lightning-insurance/:id', async (req, res) => {
  const { id } = req.params;
  const { PolicyID, Peril } = req.body;

  try {
    const result = await executeQuery(
      'UPDATE FireLightningInsurance SET PolicyID = ?, Peril = ? WHERE FireLightningInsuranceID = ?',
      [PolicyID, Peril, id]
    );
    result.affectedRows > 0 ? res.status(200).json({ message: 'Fire Lightning Insurance updated successfully' }) : res.status(404).json({ message: 'Fire Lightning Insurance not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a Fire Lightning Insurance record by ID
app.delete('/fire-lightning-insurance/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await executeQuery('DELETE FROM FireLightningInsurance WHERE FireLightningInsuranceID = ?', [id]);
    result.affectedRows > 0 ? res.status(204).send() : res.status(404).json({ message: 'Fire Lightning Insurance not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post('/marine-insurance', async (req, res) => {
    const MarineInsuranceID = uuidv4(); // Generate a unique ID for MarineInsuranceID
    const { PolicyID, Type } = req.body;
  
    try {
      const result = await executeQuery(
        'INSERT INTO MarineInsurance (MarineInsuranceID, PolicyID, Type) VALUES (?, ?, ?)',
        [MarineInsuranceID, PolicyID, Type]
      );
  
      res.status(201).json({ MarineInsuranceID, message: 'Marine Insurance created successfully!' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get all Marine Insurance records
  app.get('/marine-insurance', async (req, res) => {
    try {
      const result = await executeQuery('SELECT * FROM MarineInsurance');
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve marine insurance records.' });
    }
  });
  
  // Get a specific Marine Insurance record by ID
  app.get('/marine-insurance/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await executeQuery('SELECT * FROM MarineInsurance WHERE MarineInsuranceID = ?', [id]);
      result.length > 0 ? res.status(200).json(result[0]) : res.status(404).json({ message: 'Marine Insurance not found' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Update a Marine Insurance record by ID
  app.put('/marine-insurance/:id', async (req, res) => {
    const { id } = req.params;
    const { PolicyID, Type } = req.body;
  
    try {
      const result = await executeQuery(
        'UPDATE MarineInsurance SET PolicyID = ?, Type = ? WHERE MarineInsuranceID = ?',
        [PolicyID, Type, id]
      );
      result.affectedRows > 0 ? res.status(200).json({ message: 'Marine Insurance updated successfully' }) : res.status(404).json({ message: 'Marine Insurance not found' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Delete a Marine Insurance record by ID
  app.delete('/marine-insurance/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await executeQuery('DELETE FROM MarineInsurance WHERE MarineInsuranceID = ?', [id]);
      result.affectedRows > 0 ? res.status(204).send() : res.status(404).json({ message: 'Marine Insurance not found' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


app.post('/motor-insurance', async (req, res) => {
    const MotorInsuranceID = uuidv4(); // Generate a unique ID for MotorInsuranceID
    const { PolicyID, Purpose } = req.body;
    console.log("motor")
    console.log(req.body)
  
    try {
      const result = await executeQuery(
        'INSERT INTO MotorInsurance (MotorInsuranceID, PolicyID, Purpose) VALUES (?, ?, ?)',
        [MotorInsuranceID, PolicyID, Purpose]
      );
  
      res.status(201).json({ MotorInsuranceID, message: 'Motor Insurance created successfully!' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
// Get all Motor Insurance records
app.get('/motor-insurance', async (req, res) => {
    try {
      const result = await executeQuery('SELECT * FROM MotorInsurance');
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve motor insurance records.' });
    }
  });
  
  // Get a specific Motor Insurance record by ID
  app.get('/motor-insurance/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await executeQuery('SELECT * FROM MotorInsurance WHERE MotorInsuranceID = ?', [id]);
      result.length > 0 ? res.status(200).json(result[0]) : res.status(404).json({ message: 'Motor Insurance not found' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Update a Motor Insurance record by ID
  app.put('/motor-insurance/:id', async (req, res) => {
    const { id } = req.params;
    const { PolicyID, Purpose } = req.body;
  
    try {
      const result = await executeQuery(
        'UPDATE MotorInsurance SET PolicyID = ?, Purpose = ? WHERE MotorInsuranceID = ?',
        [PolicyID, Purpose, id]
      );
      result.affectedRows > 0 ? res.status(200).json({ message: 'Motor Insurance updated successfully' }) : res.status(404).json({ message: 'Motor Insurance not found' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Delete a Motor Insurance record by ID
  app.delete('/motor-insurance/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await executeQuery('DELETE FROM MotorInsurance WHERE MotorInsuranceID = ?', [id]);
      result.affectedRows > 0 ? res.status(204).send() : res.status(404).json({ message: 'Motor Insurance not found' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/insurance-policies', async (req, res) => {
    const {
      PolicyID, // Accept PolicyID from request if provided
      PolicyNo,
      PolicyType,
      NameOfInsured,
      Premium,
      SumInsured,
      PeriodStart,
      PeriodEnd,
      RenewalDate,
      PolicyStatus,
      CreatedBy,
      CreatedOn,
      IsDeleted,
      InsurableObjectID,
      ClientID,
    } = req.body;
  
    console.log('Request Body:', req.body);  // Log the incoming request data
  
    try {
      // Determine whether to use the provided PolicyID or generate a new one
      const policyIdClause = PolicyID ? '?' : 'NEWID()';
      
      const query = `
        INSERT INTO dbo.InsurancePolicy
        (PolicyID, PolicyNo, PolicyType, ClientID, NameOfInsured, Premium, SumInsured, PeriodStart, PeriodEnd, RenewalDate, PolicyStatus, CreatedBy, CreatedOn, IsDeleted, InsurableObjectID)
        VALUES (${policyIdClause}, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        ...(PolicyID ? [PolicyID] : []), // Include PolicyID if it's provided
        PolicyNo, PolicyType, ClientID, NameOfInsured, Premium, SumInsured, 
        PeriodStart, PeriodEnd, RenewalDate, PolicyStatus, CreatedBy, CreatedOn, 
        IsDeleted, InsurableObjectID
      ];
  
      // Debugging: Log the query and parameters
      console.log('Executing Query:', query);
      console.log('Query Parameters:', params);
  
      // Execute the query with parameters
      await executeQuery(query, params);
  
      // Respond to the client with success
      res.status(201).json({ message: 'Insurance Policy created successfully!' });
    } catch (error) {
      // Log the error to the console for more details
      console.error('Error executing query:', error);
  
      // If it's a specific SQL error, provide more details
      if (error.message.includes('SQL')) {
        res.status(500).json({ error: 'Database error occurred', details: error.message });
      } else {
        // Respond with the generic error message if it's not SQL-specific
        res.status(500).json({ error: 'Internal server error', details: error.message });
      }
    }
  });
  
  
  
  

// READ
app.get('/insurance-policies', async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM InsurancePolicy');
        res.status(200).json(result);  // Send the entire result array
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/insurance-policies/:id', async (req, res) => {
  const { id } = req.params;
  console.log(req.params)
  try {
    const result = await executeQuery('SELECT * FROM InsurancePolicy WHERE PolicyID = ?', [id]);
    
    // Send the first result or a 404 if no policy is found
    result.length > 0 ? res.status(200).json(result[0]) : res.status(404).json({ message: 'Insurance policy not found' });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE
app.put('/insurance-policies/:id', async (req, res) => {
    const { id } = req.params;
    const {
        PolicyNo,
        PolicyType,
        ClientID,
        NameOfInsured,
        AddressID,
        Premium,
        SumInsured,
        PeriodStart,
        PeriodEnd,
        RenewalDate,
        PolicyStatus,
        CreatedBy,
        CreatedOn,
        IsDeleted
    } = req.body;

    try {
        const result = await executeQuery(
            'UPDATE InsurancePolicy SET PolicyNo = ?, PolicyType = ?, ClientID = ?, NameOfInsured = ?, AddressID = ?, Premium = ?, SumInsured = ?, PeriodStart = ?, PeriodEnd = ?, RenewalDate = ?, PolicyStatus = ?, CreatedBy = ?, CreatedOn = ?, IsDeleted = ? WHERE PolicyID = ?',
            [PolicyNo, PolicyType, ClientID, NameOfInsured, AddressID, Premium, SumInsured, PeriodStart, PeriodEnd, RenewalDate, PolicyStatus, CreatedBy, CreatedOn, IsDeleted, id]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Insurance Policy updated successfully' });
        } else {
            res.status(404).json({ message: 'Insurance Policy not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE
app.delete('/insurance-policies/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await executeQuery('DELETE FROM InsurancePolicy WHERE PolicyID = ?', [id]);

        if (result.affectedRows > 0) {
            res.status(204).send(); // No content on successful deletion
        } else {
            res.status(404).json({ message: 'Insurance Policy not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
