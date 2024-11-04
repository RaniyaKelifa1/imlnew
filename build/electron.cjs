const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const odbc = require('odbc'); // Ensure the odbc package is installed

const serverApp = express();
const PORT = 5000;

// Middleware setup
serverApp.use(cors());
serverApp.use(express.json());

// Database connection string
const connectionString = 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\dev;Database=BM_IMS_PhaseI;Trusted_Connection=yes;';

// Function to execute database queries
const executeQuery = async (query, params = []) => {
    let connection;
    try {
        connection = await odbc.connect(connectionString);
        const result = await connection.query(query, params);
        return result;
    } catch (error) {
        console.error('Database error:', error);
        throw error; // Rethrow the error for the caller to handle
    } finally {
        if (connection) {
            await connection.close(); // Ensure the connection is closed
        }
    }
};
serverApp.put('/policies/:policyId', async (req, res) => {
    const {
        PolicyNo,
        PolicyType,
        Premium,
        PeriodStart,
        PeriodEnd,
        RenewalDate,
        PolicyStatus,
        CreatedBy,
        ClientID,
        CompanyID,
        Branch,
        ExternalPolicyNo,
        GeographicalArea,
        Commission,
        BranchName,
        BranchTelephone,
        BranchEmail,
        CreatedAt,
        PersonID,
        PVT,
        ThirdPartyExtension,
        PolicyLiabilityLimit
    } = req.body;

    const PolicyID = req.params.policyId; // Get the PolicyID from the URL parameter

    try {
        // Update the policy in the InsurancePolicy table
        const result = await executeQuery(
            `UPDATE InsurancePolicy SET
                PolicyNo = ?,
                PolicyType = ?,
                Premium = ?,
                PeriodStart = ?,
                PeriodEnd = ?,
                RenewalDate = ?,
                PolicyStatus = ?,
                CreatedBy = ?,
                ClientID = ?,
                CompanyID = ?,
                Branch = ?,
                ExternalPolicyNo = ?,
                GeographicalArea = ?,
                Commission = ?,
                BranchName = ?,
                BranchTelephone = ?,
                BranchEmail = ?,
                CreatedAt = ?,
                PersonID = ?,
                PVT = ?,
                ThirdPartyExtension = ?,
                PolicyLiabilityLimit = ?
            WHERE PolicyID = ?`,
            [
                PolicyNo,
                PolicyType,
                Premium,
                PeriodStart,
                PeriodEnd,
                RenewalDate,
                PolicyStatus,
                CreatedBy,
                ClientID,
                CompanyID,
                Branch,
                ExternalPolicyNo,
                GeographicalArea,
                Commission,
                BranchName,
                BranchTelephone,
                BranchEmail,
                CreatedAt || new Date(), // Defaults to current datetime if not provided
                PersonID,
                PVT ? 1 : 0, // Convert PVT to bit
                ThirdPartyExtension ? 1 : 0, // Convert ThirdPartyExtension to bit
                PolicyLiabilityLimit,
                PolicyID // Ensure to include the PolicyID at the end for the WHERE clause
            ]
        );

        if (result.affectedRows > 0) {
            // Return success response
            res.status(200).json({ message: 'Policy updated successfully.' });
        } else {
            // If no rows were affected, the PolicyID may not exist
            res.status(404).json({ message: 'Policy not found.' });
        }
    } catch (err) {
        console.error('Error updating policy:', err);
        res.status(500).json({ message: 'An error occurred while updating the policy. ' + err.message });
    }
});

serverApp.post('/policy', async (req, res) => {
    const {
        PolicyNo,
        PolicyType,
        Premium,
        PeriodStart,
        PeriodEnd,
        RenewalDate,
        PolicyStatus,
        CreatedBy,
        CreatedOn,
        ClientID,
        CompanyID,
        Branch,
        ExternalPolicyNo,
        GeographicalArea,
        Commission,
        BranchName,
        BranchTelephone,
        BranchEmail,
        CreatedAt,
        PersonID,
        PVT,
        ThirdPartyExtension,
        PolicyLiabilityLimit
    } = req.body;

    // Generate unique PolicyID
    const PolicyID = uuidv4().replace(/-/g, '').substring(0, 10);

    try {
        // Insert the policy into the Policy table
        await executeQuery(
            `INSERT INTO InsurancePolicy (
                PolicyID,
                PolicyNo,
                PolicyType,
                Premium,
                PeriodStart,
                PeriodEnd,
                RenewalDate,
                PolicyStatus,
                CreatedBy,
                CreatedOn,
                ClientID,
                CompanyID,
                Branch,
                ExternalPolicyNo,
                GeographicalArea,
                Commission,
                BranchName,
                BranchTelephone,
                BranchEmail,
                CreatedAt,
                PersonID,
                PVT,
                ThirdPartyExtension,
                PolicyLiabilityLimit
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                PolicyID,
                PolicyNo,
                PolicyType,
                Premium,
                PeriodStart,
                PeriodEnd,
                RenewalDate,
                PolicyStatus,
                CreatedBy,
                CreatedOn || new Date(), // Defaults to current datetime if not provided
                ClientID,
                CompanyID,
                Branch,
                ExternalPolicyNo,
                GeographicalArea,
                Commission,
                BranchName,
                BranchTelephone,
                BranchEmail,
                CreatedAt || new Date(), // Defaults to current datetime if not provided
                PersonID,
                PVT ? 1 : 0, // Convert PVT to bit
                ThirdPartyExtension ? 1 : 0, // Convert ThirdPartyExtension to bit
                PolicyLiabilityLimit
            ]
        );

        // Return success response with the new PolicyID
        res.status(201).json({ id: PolicyID });
    } catch (err) {
        console.error('Error creating policy:', err);
        res.status(500).json({ message: 'An error occurred while creating the policy. ' + err.message });
    }
});


// API endpoint to test the database connection
serverApp.get('/api/test', async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM Address'); // Change 'Address' to your actual table name
        res.json({ message: 'Connection successful!', data: result });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ message: 'Database connection failed', error: error.message });
    }
});
// Create a new claim
serverApp.post('/claims', async (req, res) => {
    const { 
        ClaimNumber, 
        PolicyID, 
        ClaimDate, 
        ReportDate, 
        DriverName, 
        DriversLicense, 
        DriversLicenseRenewalDate, 
        VehicleID, 
        ThirdPartyInvolved, 
        TPPlateNumber, 
        TPAddress, 
        TPInsurer, 
        TPClaimAmount, 
        PoliceReport, 
        ClaimStatus ,
        AccReportDate,
        ExternalNumber

    } = req.body;

    const ClaimID = uuidv4().replace(/-/g, '').substring(0, 10); // Generate unique ClaimID

    try {
        // Execute the SQL query to insert the claim data into the database
        await executeQuery(`
            INSERT INTO Claims (
                ClaimID, 
                ClaimNumber, 
                PolicyID, 
                ClaimDate, 
                ReportDate, 
                DriverName, 
                DriversLicense, 
                DriversLicenseRenewalDate, 
                VehicleID, 
                ThirdPartyInvolved, 
                TPPlateNumber, 
                TPAddress, 
                TPInsurer, 
                TPClaimAmount, 
                PoliceReport, 
                ClaimStatus,
                AccReportDate,
                ExternalNumber
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)`, 
            [
                ClaimID, 
                ClaimNumber, 
                PolicyID, 
                ClaimDate, 
                ReportDate || null, // Optional field
                DriverName, 
                DriversLicense, 
                DriversLicenseRenewalDate, 
                VehicleID || null, // Optional field
                ThirdPartyInvolved || 0, // Default to 0 if not provided
                TPPlateNumber || null, // Optional field
                TPAddress || null, // Optional field
                TPInsurer || null, // Optional field
                TPClaimAmount || null, // Optional field
                PoliceReport || null, // Optional field
                ClaimStatus || 'Ongoing', // Default to 'Ongoing' if not provided
                AccReportDate || null,
                ExternalNumber || null
            ]
        );

        // Respond with success and the new ClaimID
        res.status(201).json({ id: ClaimID });
    } catch (err) {
        console.error('Error inserting claim:', err); // Log the error for debugging
        res.status(500).send('Failed to add claim');
    }
});

// Get a claim by ID
serverApp.get('/claims/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const claim = await executeQuery('SELECT * FROM Claims WHERE ClaimID = ?', [id]);
        
        if (claim.length === 0) {
            return res.status(404).send('Claim not found');
        }

        res.json(claim[0]); // Send back the found claim
    } catch (err) {
        console.error('Error retrieving claim:', err); // Log the error for debugging
        res.status(500).send('Failed to retrieve claim');
    }
});

serverApp.get('/claims', async (req, res) => {
    try {
        const results = await executeQuery('SELECT TOP 10 * FROM Claims');
        if (!results || results.length === 0) {
            return res.status(404).json({ message: 'No claims found' });
        }
        res.json(results);
    } catch (err) {
        console.error('Error fetching claims:', err.message, err.stack); // Log detailed error
        res.status(500).json({ message: 'Failed to fetch claims', error: err.message });
    }
});

// Update a claim by ID
serverApp.put('/claims/:id', async (req, res) => {
    const { id } = req.params;
    const { 
        ClaimNumber, 
        PolicyID, 
        ClaimDate, 
        ReportDate, 
        DriverName, 
        DriversLicense, 
        DriversLicenseRenewalDate, 
        VehicleID, 
        ThirdPartyInvolved, 
        TPPlateNumber, 
        TPAddress, 
        TPInsurer, 
        TPClaimAmount, 
        PoliceReport, 
        ClaimStatus 
    } = req.body;

    try {
        await executeQuery(`
            UPDATE Claims SET 
                ClaimNumber = ?, 
                PolicyID = ?, 
                ClaimDate = ?, 
                ReportDate = ?, 
                DriverName = ?, 
                DriversLicense = ?, 
                DriversLicenseRenewalDate = ?, 
                VehicleID = ?, 
                ThirdPartyInvolved = ?, 
                TPPlateNumber = ?, 
                TPAddress = ?, 
                TPInsurer = ?, 
                TPClaimAmount = ?, 
                PoliceReport = ?, 
                ClaimStatus = ?
            WHERE ClaimID = ?`, 
            [
                ClaimNumber, 
                PolicyID, 
                ClaimDate, 
                ReportDate || null, // Optional field
                DriverName, 
                DriversLicense, 
                DriversLicenseRenewalDate, 
                VehicleID || null, // Optional field
                ThirdPartyInvolved || 0, // Default to 0 if not provided
                TPPlateNumber || null, // Optional field
                TPAddress || null, // Optional field
                TPInsurer || null, // Optional field
                TPClaimAmount || null, // Optional field
                PoliceReport || null, // Optional field
                ClaimStatus || 'Ongoing', // Default to 'Ongoing' if not provided
                id // The claim ID to update
            ]
        );

        res.json({ message: 'Claim updated successfully' });
    } catch (err) {
        console.error('Error updating claim:', err); // Log the error for debugging
        res.status(500).send('Failed to update claim');
    }
});

// Delete a claim by ID
serverApp.delete('/claims/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await executeQuery('DELETE FROM Claims WHERE ClaimID = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Claim not found');
        }

        res.json({ message: 'Claim deleted successfully' });
    } catch (err) {
        console.error('Error deleting claim:', err); // Log the error for debugging
        res.status(500).send('Failed to delete claim');
    }
});
// Create a new claim step
serverApp.post('/claim-steps', async (req, res) => {
    const { ClaimID, StepName, StepDate, StepStatus, StepDetail, Document } = req.body;
    
    // Generate a new StepID
    const StepID = uuidv4();

    try {
        await executeQuery(
            'INSERT INTO ClaimSteps (StepID, ClaimID, StepName, StepDate, StepStatus, StepDetail, Document) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [StepID, ClaimID, StepName, StepDate, StepStatus, StepDetail, Document]
        );
        res.status(201).json({ message: 'Claim step created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Retrieve all claim steps
serverApp.get('/claim-steps', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM ClaimSteps');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Retrieve a specific claim step by StepID
serverApp.get('/claim-steps/:StepID', async (req, res) => {
    const { StepID } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM ClaimSteps WHERE StepID = ?', [StepID]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
serverApp.get('/claim-steps/claim/:claimId', async (req, res) => {
    const { claimId } = req.params;

    try {
        const result = await executeQuery('SELECT * FROM ClaimSteps WHERE ClaimID = ?', [claimId]);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving claim steps for the claim: ' + err.message);
    }
});
// Delete payments associated with a specific claim
serverApp.delete('/payments/claim/:claimId', async (req, res) => {
    const { claimId } = req.params;

    try {
        const result = await executeQuery('DELETE FROM Payments WHERE ClaimID = ?', [claimId]);
        res.send('Payments for the claim deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting Payments for the claim: ' + err.message);
    }
});

// Delete claim steps associated with a specific claim
serverApp.delete('/claim-steps/claim/:claimId', async (req, res) => {
    const { claimId } = req.params;

    try {
        const result = await executeQuery('DELETE FROM ClaimSteps WHERE ClaimID = ?', [claimId]);
        res.send('Claim steps for the claim deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting claim steps for the claim: ' + err.message);
    }
});

serverApp.get('/payments/claim/:claimId', async (req, res) => {
    const { claimId } = req.params;

    try {
        const result = await executeQuery('SELECT * FROM Payments WHERE ClaimID = ?', [claimId]);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving Payments for the claim: ' + err.message);
    }
});
// Update a claim step by StepID
serverApp.put('/claim-steps/:StepID', async (req, res) => {
    const { StepID } = req.params;
    const { StepStatus, StepDetail, Document } = req.body;
    try {
        await executeQuery(
            'UPDATE ClaimSteps SET StepStatus = ?, StepDetail = ?, Document = ? WHERE StepID = ?',
            [StepStatus, StepDetail, Document, StepID]
        );
        res.json({ message: 'Claim step updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a claim step by StepID
serverApp.delete('/claim-steps/:StepID', async (req, res) => {
    const { StepID } = req.params;
    try {
        await executeQuery('DELETE FROM ClaimSteps WHERE StepID = ?', [StepID]);
        res.json({ message: 'Claim step deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// API endpoint to get vehicles

// Vehicle routes
serverApp.get('/vehicles', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM Vehicle');
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});

serverApp.get('/vehicles/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const results = await executeQuery('SELECT * FROM Vehicle WHERE VehicleID = ?', [id]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).send(err);
    }
});



serverApp.post('/vehicles', async (req, res) => {
    const { MakeAndModel, Year, BodyType, PlateNo, SerialNoOrChassisNo, CarrierCapacity, SeatCapacity, SumInsured, EngineNo, UseOfVehicle, CC_HP, DutyFree, BoloDate, Remark } = req.body;
    const VehicleID = uuidv4().replace(/-/g, '').substring(0, 10);

    // Ensure values are of correct type
    const year = parseInt(Year, 10);
    const seatCapacity = parseInt(SeatCapacity, 10);
    const sumInsured = parseFloat(SumInsured);
    const carrierCapacity = parseInt(CarrierCapacity, 10);

    console.log({
        VehicleID,
        MakeAndModel,
        year,
        BodyType,
        PlateNo,
        SerialNoOrChassisNo,
        carrierCapacity,
        seatCapacity,
        sumInsured,
        EngineNo,
        UseOfVehicle,
        CC_HP,
        DutyFree,
        BoloDate,
        Remark
    });

    try {
        // Execute the SQL query to insert the vehicle data into the database
        await executeQuery(
            'INSERT INTO Vehicle (VehicleID, MakeAndModel, Year, BodyType, PlateNo, SerialNoOrChassisNo, CarrierCapacity, SeatCapacity, SumInsured, EngineNo, UseOfVehicle, CC_HP, DutyFree, BoloDate, Remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [VehicleID, MakeAndModel, year, BodyType, PlateNo, SerialNoOrChassisNo, carrierCapacity, seatCapacity, sumInsured, EngineNo, UseOfVehicle, CC_HP, DutyFree, BoloDate, Remark]
        );

        // Respond with success and the new VehicleID
        res.status(201).json({ VehicleID }); // Ensure you're returning the VehicleID here
    } catch (err) {
        console.error('Error inserting vehicle:', err); // Log the error for debugging
        res.status(500).send('Failed to add vehicle');
    }
});


serverApp.put('/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    const {
        MakeAndModel, Year, BodyType, PlateNo, SerialNoOrChassisNo,
        CarrierCapacity, SeatCapacity, SumInsured, EngineNo,
        UseOfVehicle, CC_HP, DutyFree,BoloDate
    } = req.body;

    try {
        await executeQuery(
            'UPDATE Vehicle SET MakeAndModel = ?, Year = ?, BodyType = ?, PlateNo = ?, SerialNoOrChassisNo = ?, CarrierCapacity = ?, SeatCapacity = ?, SumInsured = ?, EngineNo = ?, UseOfVehicle = ?, CC_HP = ?, BoloDate=?,DutyFree = ? WHERE VehicleID = ?', 
            [MakeAndModel, Year, BodyType, PlateNo, SerialNoOrChassisNo, CarrierCapacity, SeatCapacity, SumInsured, EngineNo, UseOfVehicle, CC_HP, DutyFree,BoloDate, id]
        );
        res.json({ message: 'Vehicle updated successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});

serverApp.delete('/vehicles/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await executeQuery('DELETE FROM Vehicle WHERE VehicleID = ?', [id]);
        res.json({ affectedRows: result.affectedRows });
    } catch (err) {
        res.status(500).send(err);
    }
});
serverApp.get('/addresses', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM Address');
        res.json(results);
    } catch (err) {
        console.error('Error retrieving addresses:', err);
        res.status(500).send('Failed to retrieve addresses');
    }
});
serverApp.get('/policies', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM InsurancePolicy');
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});
serverApp.get('/policies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM InsurancePolicy WHERE PolicyID = ?', [id]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).send(err);
    }
});

serverApp.delete('/policies/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // First, delete from the InsurableObject table
        await executeQuery('DELETE FROM InsurableObject WHERE PolicyID = ?', [id]);
        
        // Then delete from the InsurancePolicy table
        const result = await executeQuery('DELETE FROM InsurancePolicy WHERE PolicyID = ?', [id]);

        res.json({ affectedRows: result.affectedRows });
    } catch (err) {
        console.error(err); // Log error for debugging
        res.status(500).send(err);
    }
});

serverApp.get('/insurableobjects', async (req, res) => {

    try {
        const results = await executeQuery('SELECT * FROM InsurableObject');
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});
serverApp.get('/insurableobjects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM InsurableObject WHERE InsurableObjectID = ?', [id]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Create a new insurable object
serverApp.post('/insurableobjects', async (req, res) => {
    const { ObjectID, PolicyID, ObjectType } = req.body;
    const InsurableObjectID = uuidv4().replace(/-/g, '').substring(0, 10); // Generate unique InsurableObjectID
    try {
        await executeQuery('INSERT INTO InsurableObject (InsurableObjectID, ObjectID, ObjectType, PolicyID) VALUES (?, ?, ?, ?)', 
        [InsurableObjectID, ObjectID, ObjectType, PolicyID]);
        res.status(201).json({ id: InsurableObjectID });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Update an insurable object by ID
serverApp.put('/insurableobjects/:id', async (req, res) => {
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
serverApp.delete('/insurableobjects/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await executeQuery('DELETE FROM InsurableObject WHERE InsurableObjectID = ?', [id]);
        res.json({ message: 'InsurableObject deleted successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});
// Create Insurance Company
serverApp.post('/insurance-companies', async (req, res) => {
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
serverApp.get('/insurance-companies', async (req, res) => {
    try {
        const companies = await executeQuery('SELECT * FROM InsuranceCompany');
        res.status(200).json(companies);
    } catch (err) {
        console.error('Error fetching insurance companies:', err);
        res.status(500).json({ message: 'Failed to fetch insurance companies' });
    }
});

// Read a Single Insurance Company by ID
serverApp.get('/insurance-companies/:id', async (req, res) => {
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
serverApp.put('/insurance-companies/:id', async (req, res) => {
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
serverApp.get('/persons', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM Person');
        res.json(results);
    } catch (err) {
        console.error('Error retrieving persons:', err);
        res.status(500).send('Failed to retrieve persons');
    }
});

serverApp.delete('/persons/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await executeQuery('DELETE FROM Person WHERE PersonID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Person not found' });
        }
        res.json({ message: 'Person deleted successfully' });
    } catch (err) {
        console.error('Error deleting person:', err);
        res.status(500).send('Error deleting record');
    }
});
serverApp.put('/addresses/:id', async (req, res) => {
    const { id } = req.params;
    const { City, Subcity, HouseNo, Wereda } = req.body;
    try {
        const result = await executeQuery('UPDATE Address SET City = ?, Subcity = ?, HouseNo = ?, Wereda = ? WHERE AddressID = ?', [City, Subcity, HouseNo, Wereda, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.json({ message: 'Address updated successfully' });
    } catch (err) {
        console.error('Error updating address:', err);
        res.status(500).send('Error updating record');
    }
});
serverApp.delete('/addresses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await executeQuery('DELETE FROM Address WHERE AddressID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.json({ message: 'Address deleted successfully' });
    } catch (err) {
        console.error('Error deleting address:', err);
        res.status(500).send('Error deleting record');
    }
});

serverApp.put('/policies/:id', async (req, res) => {
    const { id } = req.params;
    const {
        PolicyNo,
        PolicyType,
        Premium,
        PeriodStart,
        PeriodEnd,
        RenewalDate,
        PolicyStatus,
        CreatedBy,
        ClientID,
        CompanyID,
        Branch,
        ExternalPolicyNo,
        GeographicalArea,
        Commission,
        BranchName,
        BranchTelephone,
        BranchEmail,
        CreatedAt,
        PersonID,
        PVT,
        ThirdPartyExtension,
        PolicyLiabilityLimit
    } = req.body;

    try {
        // Update the policy in the InsurancePolicy table
        const result = await executeQuery(
            `UPDATE InsurancePolicy SET
                PolicyNo = ?,
                PolicyType = ?,
                Premium = ?,
                PeriodStart = ?,
                PeriodEnd = ?,
                RenewalDate = ?,
                PolicyStatus = ?,
                CreatedBy = ?,
                ClientID = ?,
                CompanyID = ?,
                Branch = ?,
                ExternalPolicyNo = ?,
                GeographicalArea = ?,
                Commission = ?,
                BranchName = ?,
                BranchTelephone = ?,
                BranchEmail = ?,
                CreatedAt = ?,
                PersonID = ?,
                PVT = ?,
                ThirdPartyExtension = ?,
                PolicyLiabilityLimit = ?
            WHERE PolicyID = ?`,
            [
                PolicyNo,
                PolicyType,
                Premium,
                PeriodStart,
                PeriodEnd,
                RenewalDate,
                PolicyStatus,
                CreatedBy,
                ClientID,
                CompanyID,
                Branch,
                ExternalPolicyNo,
                GeographicalArea,
                Commission,
                BranchName,
                BranchTelephone,
                BranchEmail,
                CreatedAt || new Date(),
                PersonID,
                PVT ? 1 : 0,
                ThirdPartyExtension ? 1 : 0,
                PolicyLiabilityLimit,
                id
            ]
        );

        console.log('Result of the update:', result);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Policy updated successfully.' });
        } else {
            res.status(404).json({ message: 'Policy not found.' });
        }
    } catch (err) {
        console.error('Error updating policy:', err);
        res.status(500).json({ message: 'An error occurred while updating the policy.', error: err.message });
    }
});


// Get a person by ID
serverApp.get('/persons/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM Person WHERE PersonID = ?', [id]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Person not found' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Error retrieving person by ID:', err);
        res.status(500).send('Failed to retrieve person');
    }
});

// Create a new person
serverApp.post('/persons', async (req, res) => {
    const {
        FirstName,
        LastName,
        PhoneNumber,
        Email,
        PersonTypeID,
        NationalIDNo,
        City,
        Subcity,
        HouseNo,
        Wereda,
        Gender,
        DateOfBirth,
    } = req.body;

    const PersonID = uuidv4().replace(/-/g, '').substring(0, 10); // Generate unique PersonID
    const ClientID = uuidv4().replace(/-/g, '').substring(0, 10); // Generate unique ClientID
    const Name = `${FirstName} ${LastName}`;
    
    try {
        // Insert into Address table and get the AddressID
        const addressResult = await executeQuery(
            'INSERT INTO Address (City, Subcity, HouseNo, Wereda) OUTPUT INSERTED.AddressID VALUES (?, ?, ?, ?)', 
            [City, Subcity, HouseNo, Wereda]  // Ensure 4 values for 4 placeholders
        );

        const AddressID = addressResult[0].AddressID; // Retrieve the inserted AddressID

        // Insert into Person table with the retrieved AddressID
        await executeQuery(
            'INSERT INTO Person (PersonID, FirstName, LastName, Name, PhoneNumber, Email, PersonTypeID, NationalIDNo, AddressID, Gender, DateOfBirth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [
                PersonID,
                FirstName,
                LastName,
                Name,
                PhoneNumber,
                Email,
                PersonTypeID,
                NationalIDNo,
                AddressID,
                Gender || null,
                DateOfBirth || null
            ]
        );

        // Insert into Client table
        await executeQuery(
            'INSERT INTO Client (ClientID, ClientType, PersonID, OrganizationID) VALUES (?, ?, ?, ?)', 
            [ClientID, 'Person', PersonID, null] // Ensure 4 values for 4 placeholders
        );

        res.status(201).json({ id: PersonID });
    } catch (err) {
        let errorMessage = 'An error occurred while adding the contact person and client.';
    
        // Customize the error message based on the stage of the insertion process
        if (err.message.includes('Address')) {
            errorMessage = 'Error inserting into Address table: ' + err.message;
        } else if (err.message.includes('Person')) {
            errorMessage = 'Error inserting into Person table: ' + err.message;
        } else if (err.message.includes('Client')) {
            errorMessage = 'Error inserting into Client table: ' + err.message;
        }
    
        console.error('Detailed error:', err);
        res.status(500).json({ message: errorMessage + err.message });
    }
});




serverApp.get('/person-types', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM PersonType');
        res.json(results);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Get a person type by ID
serverApp.get('/person-types/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM PersonType WHERE PersonTypeID = ?', [id]);
        if (results.length === 0) {
            res.status(404).json({ message: 'PersonType not found' });
        } else {
            res.json(results[0]);
        }
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Create a new person type
serverApp.post('/person-types', async (req, res) => {
    const { TypeName } = req.body;

    if (!TypeName) {
        return res.status(400).json({ message: 'TypeName is required' });
    }

    try {
        // Insert the new person type
        await executeQuery('INSERT INTO PersonType (Ptype) VALUES (?)', [TypeName]);

        // Get the last inserted ID
        const result = await executeQuery('SELECT LAST_INSERT_ID() AS PersonTypeID');
        res.status(201).json({ PersonTypeID: result[0].PersonTypeID });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Get all insurance policy types
serverApp.get('/insurancepolicytypes', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM InsurancePolicyType');
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Get an insurance policy type by ID
serverApp.get('/insurancepolicytypes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM InsurancePolicyType WHERE InsurancePolicyTypeID = ?', [id]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).send(err);
    }
});
serverApp.get('/organizationtype', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM OrganizationType');
        res.json(results);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

serverApp.get('/addresses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM Address WHERE AddressID = ?', [id]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Error retrieving address by ID:', err);
        res.status(500).send('Failed to retrieve address');
    }
});

// Create a new insurance policy type
serverApp.post('/insurancepolicytypes', async (req, res) => {
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
serverApp.put('/insurancepolicytypes/:id', async (req, res) => {
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
serverApp.delete('/insurancepolicytypes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await executeQuery('DELETE FROM InsurancePolicyType WHERE InsurancePolicyTypeID = ?', [id]);
        res.json({ message: 'InsurancePolicyType deleted successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});
serverApp.get('/organizations', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM Organization');
        res.json(results);
    } catch (err) {
        console.error('Error retrieving organizations:', err);
        res.status(500).send('Failed to retrieve organizations');
    }
});

// Get an organization by ID
serverApp.get('/organizations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const results = await executeQuery('SELECT * FROM Organization WHERE OrganizationID = ?', [id]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Organization not found' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Error retrieving organization by ID:', err);
        res.status(500).send('Failed to retrieve organization');
    }
});


serverApp.delete('/organizations/:organizationID', async (req, res) => {
    const { organizationID } = req.params;

    try {
    
        await executeQuery(
            'DELETE FROM Organization WHERE OrganizationID = ?',
            [organizationID]
        );

    

        res.status(200).json({ message: 'Organization deleted successfully.' });
    } catch (err) {
        console.error('Error deleting organization:', err);
        res.status(500).json({ message: 'Failed to delete organization.' });
    }
});



serverApp.post('/organizations', async (req, res) => {
    const { Name, PhoneNumber, Email, OrganizationTypeID, TINNo, City, Subcity, HouseNo, Wereda, PersonID } = req.body; // Ensure all necessary fields are included

    const OrganizationID = uuidv4().replace(/-/g, '').substring(0, 10); // Generate unique OrganizationID
    const ClientID = uuidv4().replace(/-/g, '').substring(0, 10); // Generate unique ClientID

    console.log(req.body);
    console.log('Generated OrganizationID:', OrganizationID);
    console.log('Generated ClientID:', ClientID);

    try {
        // Insert into Address table and get the AddressID
        const addressResult = await executeQuery(
            'INSERT INTO Address (City, Subcity, HouseNo, Wereda) OUTPUT INSERTED.AddressID VALUES (?, ?, ?, ?)', 
            [City, Subcity, HouseNo, Wereda]  // Ensure 4 values for 4 placeholders
        );

        const AddressID = addressResult[0].AddressID; // Extract the generated AddressID

        // Insert into Organization table
        await executeQuery(
            'INSERT INTO Organization (OrganizationID, Name, PhoneNumber, Email, OrganizationTypeID, TINNo, AddressID, PersonID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
            [OrganizationID, Name, PhoneNumber, Email, OrganizationTypeID, TINNo, AddressID, PersonID]
        );

        // Insert into Client table for organization
        const clientData = {
            ClientType: 'Organization',
            OrganizationID: OrganizationID,
            PersonID: PersonID || null, // Can be null if not provided
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



serverApp.put('/organizations/:id', async (req, res) => {
    const { id } = req.params;
    const { Name, PhoneNumber, Email, TINNo ,PersonID} = req.body;

    try {
        await executeQuery(
            'UPDATE Organization SET Name = ?, PhoneNumber = ?, Email = ?, TINNo = ?, PersonID = ? WHERE OrganizationID = ?',
            [Name, PhoneNumber, Email, TINNo, PersonID, id]
        );
        res.json({ message: 'Organization updated successfully' });
    } catch (err) {
        console.error(err); // Log error for debugging
        res.status(500).send({ error: 'An error occurred while updating the organization.' });
    }
});

// Client routes
serverApp.get('/clients', async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM Client');
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});

serverApp.get('/clients/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const results = await executeQuery('SELECT * FROM Client WHERE ClientID = ?', [id]);
        res.json(results[0]);
    } catch (err) {
        res.status(500).send(err);
    }
});

serverApp.post('/clients', async (req, res) => {
    const { ClientType, PersonID, OrganizationID } = req.body;
    const ClientID = generateId();

    try {
        await executeQuery(
            'INSERT INTO Client (ClientID, ClientType, PersonID, OrganizationID) VALUES (?, ?, ?, ?)', 
            [ClientID, ClientType, PersonID, OrganizationID]
        );
        res.status(201).json({ id: ClientID });
    } catch (err) {
        res.status(500).send(err);
    }
});

serverApp.put('/clients/:id', async (req, res) => {
    const { id } = req.params;
    const { ClientType, PersonID, OrganizationID } = req.body;

    try {
        const result = await executeQuery(
            'UPDATE Client SET ClientType = ?, PersonID = ?, OrganizationID = ? WHERE ClientID = ?', 
            [ClientType, PersonID, OrganizationID, id]
        );
        res.json({ affectedRows: result.affectedRows });
    } catch (err) {
        res.status(500).send(err);
    }
});

serverApp.delete('/clients/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await executeQuery('DELETE FROM Client WHERE ClientID = ?', [id]);
        res.json({ affectedRows: result.affectedRows });
    } catch (err) {
        res.status(500).send(err);
    }
});

serverApp.get('/payments', async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM Payments');
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving payments: ' + err.message);
    }
});
serverApp.post('/payments', async (req, res) => {
    const { ClaimID, PaymentAmount, PaymentDate, PaymentType, PaymentStatus } = req.body;
     const PaymentID = uuidv4().replace(/-/g, '').substring(0, 10);

    try {
        await executeQuery(
            'INSERT INTO Payments (PaymentID, ClaimID, PaymentAmount, PaymentDate, PaymentType, PaymentStatus, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, DEFAULT)',
            [PaymentID, ClaimID, PaymentAmount, PaymentDate, PaymentType, PaymentStatus]
        );
        res.json({ message: "Payment added successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding payment: ' + err.message);
    }
});

// Read all Payments or a specific Payment by ID
serverApp.get('/payments/:id?', async (req, res) => {
    const { id } = req.params;

    try {
        const result = id
            ? await executeQuery('SELECT * FROM Payments WHERE PaymentID = ?', [id])
            : await executeQuery('SELECT * FROM Payments');
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving payments: ' + err.message);
    }
});

// Update a Payment by ID
serverApp.put('/payments/:id', async (req, res) => {
    const { id } = req.params;
    const { ClaimID, PaymentAmount, PaymentDate, PaymentType, PaymentStatus } = req.body;

    try {
        await executeQuery(
            'UPDATE Payments SET ClaimID = ?, PaymentAmount = ?, PaymentDate = ?, PaymentType = ?, PaymentStatus = ? WHERE PaymentID = ?',
            [ClaimID, PaymentAmount, PaymentDate, PaymentType, PaymentStatus, id]
        );
        res.json({ message: "Payment updated successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating payment: ' + err.message);
    }
});

// Delete a Payment by ID
serverApp.delete('/payments/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await executeQuery('DELETE FROM Payments WHERE PaymentID = ?', [id]);
        res.json({ message: "Payment deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting payment: ' + err.message);
    }
});

// CREATE: Add a new Workmen's Compensation record
serverApp.post('/WorkmenCompensation', async (req, res) => {
    const { salary, assistantSalary, remark, vehicleID } = req.body;

    // Validate input
    if (!salary || !remark || !vehicleID) {
        return res.status(400).json({ message: 'Please provide salary, remark, and vehicle ID.' });
    }

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
serverApp.get('/WorkmenCompensation', async (req, res) => {
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
serverApp.put('/WorkmenCompensation/:id', async (req, res) => {
    const { id } = req.params;
    const { salary, assistantSalary, remark, vehicleID } = req.body;

    try {
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
serverApp.delete('/WorkmenCompensation/:id', async (req, res) => {
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
serverApp.get('/WorkmenCompensation/:id', async (req, res) => {
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
serverApp.post('/excess', async (req, res) => {
    const { VehicleID, title, amount } = req.body;


    try {
        const result = await executeQuery('INSERT INTO Excess (VehicleID, title, amount) VALUES (?, ?, ?)', [VehicleID, title, amount]);
        res.status(201).json({ message: 'Excess added successfully', excessID: result.insertId });
    } catch (error) {
        console.error('Error adding Excess:', error);
        res.status(500).send('Error adding record');
    }
});
serverApp.get('/excess/:vehicleId', async (req, res) => {
    const { vehicleId } = req.params;

    try {
        const result = await executeQuery('SELECT * FROM Excess WHERE VehicleID = ?', [vehicleId]);
        res.json(result);
    } catch (error) {
        console.error('Error fetching Excess:', error);
        res.status(500).send('Error fetching records');
    }
});
serverApp.get('/excess/id/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await executeQuery('SELECT * FROM Excess WHERE ExcessID = ?', [id]);
        if (result.length === 0) {
            return res.status(404).send('Excess not found');
        }
        res.json(result[0]);
    } catch (error) {
        console.error('Error fetching Excess by ID:', error);
        res.status(500).send('Error fetching record');
    }
});


serverApp.get('/excess', async (req, res) => {

    try {
        const results = await executeQuery('SELECT * FROM Excess');
        res.json(results);
    } catch (err) {
        res.status(500).send(err);
    }
});
serverApp.get('/excess/:vehicleId', async (req, res) => {
    const { vehicleId } = req.params;

    try {
        const result = await executeQuery('SELECT * FROM Excess WHERE VehicleID = ?', [vehicleId]);
        res.json(result);
    } catch (error) {
        console.error('Error fetching Excess:', error);
        res.status(500).send('Error fetching records');
    }
});
// Deleting excess entries by VehicleID
serverApp.delete('/excess/excess/:vehicleId', async (req, res) => {
    const { vehicleId } = req.params;

    try {
        const result = await executeQuery('DELETE FROM Excess WHERE VehicleID = ?', [vehicleId]);
        res.json({ message: 'Excess entries deleted successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error deleting excess entries:', error);
        res.status(500).send('Error deleting excess entries');
    }
});

serverApp.delete('/excess/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await executeQuery('DELETE FROM Excess WHERE ExcessID = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Excess not found');
        }
        res.json({ message: 'Excess deleted successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error deleting Excess:', error);
        res.status(500).send('Error deleting record');
    }
});
serverApp.put('/excess/:id', async (req, res) => {
    const { id } = req.params;
    const { title, amount } = req.body;

    try {
        const result = await executeQuery('UPDATE Excess SET title = ?, amount = ? WHERE ExcessID = ?', [title, amount, id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Excess not found');
        }
        res.json({ message: 'Excess updated successfully', affectedRows: result.affectedRows });
    } catch (error) {
        console.error('Error updating Excess:', error);
        res.status(500).send('Error updating record');
    }
});

// Define the path to the icon image and export it
const iconPath = path.join(__dirname, 'favicon.ico');

// Function to create the Electron window
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
        },
        icon: iconPath // Set the icon path
    });

    // Load the React app's build directory
    const indexPath = path.join(__dirname, 'index.html');
    console.log('Loading index file:', indexPath); // Log the path being loaded

    win.loadFile(indexPath)
        .then(() => {
            console.log('Window loaded successfully'); // Confirm the window loaded
        })
        .catch((error) => {
            console.error('Failed to load window:', error); // Log any loading errors
        });
}

// Start the Express server
function startServer() {
    serverApp.listen(PORT, () => {
        console.log(`Backend server is running on http://localhost:${PORT}`);
    });
}

// Start the server and create the Electron window when Electron is ready
app.whenReady().then(() => {
    startServer();  // Start the Express server
    createWindow(); // Create the Electron window

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Export the icon path so it can be used in other files
module.exports = { iconPath };
