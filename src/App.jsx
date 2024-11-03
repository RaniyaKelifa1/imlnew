import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './Components/InitialPages/dashboard';
import AddContactPerson from './Components/InsuredUsers/addperson';
import AddOrganization from './Components/InsuredUsers/addorg';
import AddAddress from './Components/InsuredUsers/addAddress';
import DemoViewPage from './Components/InsuredUsers/demoview';
import DemoCViewPage from './Components/InsuredUsers/democlientview';
import WelcomePage from './Components/InitialPages/loginpage';
import AddOrganizationType from './Components/InsuredUsers/AddOrganizationType';
import AddPersonType from './Components/InsuredUsers/AddPersonType';
import AddVehicle from './Components/InsuredObjects/vehicle';
import AddProperty from './Components/InsuredObjects/property';
import AddLifeObjects from './Components/InsuredObjects/life';
import AddBondDetails from './Components/InsuredObjects/bond';
import MachineriesViewPage from './Components/InsuredObjects/viewmachinary';
import LifeObjectsViewPage from './Components/InsuredObjects/lifeView';
import VehiclesViewPage from './Components/InsuredObjects/editVehicle';
import PropertyObjectsViewPage from './Components/InsuredObjects/viewproperty';
import './App.css';
import AddMachinery from './Components/InsuredObjects/machinary';
import InsurableObjectForm from './Components/InsuredObjects/ObjectTypes';
import MiscellaneousObjectsViewPage from './Components/InsuredObjects/Viewmiscel';
import AddMiscellaneousObjectPage from './Components/InsuredObjects/addMiscel';
import AddInsurancePolicy from './Components/insurancePolicy/insruancepolicy';
import AddMotorInsurance from './Components/insurancePolicy/addmotorinsurance';
import MarineInsuranceForm from './Components/insurancePolicy/addmarine';
import FireLightningInsuranceForm from './Components/insurancePolicy/addfireand';
import ViewInsurancePolicyPage from './Components/insurancePolicy/viewinsurance';
import WorkmensCompensationForm from './Components/InsuredObjects/workmen';
import WorkmenCompensationViewPage from './Components/InsuredObjects/workcompview';
import AdditionalPolicies from './Components/insurancePolicy/additionalpolicy';
import AddClaimForm from './Components/Claims/addclaim';
import ViewClaimsPage from './Components/Claims/viewClaim';
import ClaimDetailPage from './Components/Claims/viewdetial';
import AddSalesPerson from './Components/InsuredUsers/addsalesagent';

function App() {
  return (
    <Router>
      <Routes>
    
        <Route path="/" element={<WelcomePage />} />
        <Route path="/dashboard" element={<Dashboard />}>
        <Route path="ObjectForm" element={<InsurableObjectForm />} />
          <Route path="addperson" element={<AddContactPerson />} />
          <Route path="addorganization" element={<AddOrganization />} />
          <Route path="addaddress" element={<AddAddress />} />
          <Route path="add-organization-type" element={<AddOrganizationType />} />
          <Route path="addpersontype" element={<AddPersonType />} />
          <Route path="demoview" element={<DemoViewPage />} />
          <Route path="clientview" element={<DemoCViewPage />} />
          <Route path="addvehicle" element={<AddVehicle />} />
          <Route path="viewMachinary" element={<MachineriesViewPage />} />
          <Route path="addprop" element={<AddProperty />} />
          <Route path="addLife" element={<AddLifeObjects />} />
          <Route path="addMachine" element={<AddMachinery />} />
          <Route path="addBond" element={<AddBondDetails />} />
          <Route path="ViewLife" element={<LifeObjectsViewPage />} />
          <Route path="viewprop" element={<PropertyObjectsViewPage />} />
          <Route path="Viewveh" element={<VehiclesViewPage />} />
          <Route path="ViewMis" element={<MiscellaneousObjectsViewPage />} />
          <Route path="addmis" element={<AddMiscellaneousObjectPage />} />
          <Route path="AddInsurance" element={<AddInsurancePolicy/>} />
          <Route path="AddMotor" element={<AddMotorInsurance/>} />
          <Route path="AddMarine" element={<MarineInsuranceForm/>} />
          <Route path="AddFireand" element={<FireLightningInsuranceForm/>} />
          <Route path="viewInsurance" element={<ViewInsurancePolicyPage/>} />
          <Route path="workmen" element={<WorkmensCompensationForm/>} />
          <Route path="viewworkmen" element={<WorkmenCompensationViewPage/>} />
          <Route path="addpolicies" element={<AdditionalPolicies/>} />
          <Route path="addclaim" element={<AddClaimForm/>} />
          <Route path="viewClaims" element={<ViewClaimsPage/>} />
          <Route path="viewclaimdet" element={<ClaimDetailPage/>} />
          <Route path="addsales" element={<AddSalesPerson/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
