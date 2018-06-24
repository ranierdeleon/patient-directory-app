import React, { Component } from 'react';
import './App.css';
import axios from "axios";
import {API_ROOT} from "./config/api-config";
import ReactTable from "react-table";
import 'react-table/react-table.css';
import ReactModal from "react-modal";
import PlacesAutocomplete from 'react-places-autocomplete';
import { geocodeByAddress } from 'react-places-autocomplete';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'
import firebase, { auth, provider } from './config/firebase.js';

//axios.defaults.withCredentials = true;
var appElement = document.getElementById('root');

ReactModal.setAppElement(appElement);

class App extends Component {

    constructor() {
        super();
        this.state = {
            firstName: '',
            lastName: '',
            active:true,
            contactNumber: '',
            addresses: [],
            address: "",
            patients:[],
            searchQ:"",
            showModal: false,
            page: 0,
            pageSize: 10,
            activeFilter:"ALL",
            addressLine1:"",
            addressLine2:"",
            city:"",
            country:"",
            postalCode:"",
            selectedUserId:"",
            editMode:"", //Add, Edit,
            user:null, // firebase user,
            pages:-1
        }
    }

    componentDidMount() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.setState({user});
            }
        });
    }

    selectPatient = (state, rowInfo, column, instance) => {
        return {
            onClick: (e, handleOriginal) => {

                if (!rowInfo.original)
                    return;

                const {firstName, lastName, contactNumber, addresses, id, active} = rowInfo.original;

                this.setState({
                    firstName, lastName, contactNumber, addresses, active,
                    selectedUserId: id
                });
                this.handleOpenModal("Edit");

                // IMPORTANT! React-Table uses onClick internally to trigger
                // events like expanding SubComponents and pivots.
                // By default a custom 'onClick' handler will override this functionality.
                // If you want to fire the original onClick handler, call the
                // 'handleOriginal' function.
                if (handleOriginal) {
                    handleOriginal();
                }
            }
        };
    }

    handleSelect = (address) => {
        geocodeByAddress(address)
            .then(results => {
                console.log(results)
                var addressComponent = results[0].address_components;
                this.setState({
                    addressLine1:this.getAddressFromComponent(addressComponent, "street_number"),
                    addressLine2:this.getAddressFromComponent(addressComponent, "route"),
                    city:this.getAddressFromComponent(addressComponent, "locality"),
                    country:this.getAddressFromComponent(addressComponent, "country"),
                    postalCode:this.getAddressFromComponent(addressComponent, "postal_code"),
                    address: results[0].formatted_address
                });

            })
            .catch(error => console.error('Error', error))
    };

    getAddressFromComponent(component, type) {
        var result = "";

        component.forEach((address) => {
            if (address.types.includes(type)) {
                result = address.long_name.toUpperCase();
            }
        });

        return result;
    }

    searchPatients = () => {
        this.getPatients(this.state.searchQ);
    };

    handleOpenModal = editMode => {
        this.setState({ showModal: true, editMode });
    };

    handleCloseModal = () => {
        this.setState({ showModal: false }, this.clearPatientDetails);
    };

    addAddress = () => {

        const {addressLine1,addressLine2, city, country, postalCode, address} = this.state;
        if (addressLine1 || addressLine2 || city || country || postalCode || address) {

            this.setState({
                addresses:[...this.state.addresses, {
                    addressLine1,
                    addressLine2,
                    city,
                    country,
                    postalCode,
                    address
                }],
                addressLine1:"",
                addressLine2:"",
                city:"",
                country:"",
                postalCode:"",
                address:""
            });
        } else {
            alert("Please input at least one detail in address");
        }
    };

    logout = () => {
        auth.signOut()
            .then(() => {
                this.setState({
                    user: null
                });
            });
    };
    login = ()=> {
        auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                this.setState({
                    user
                });
            });
    };

    handleRemoveSpecificRow = (idx) => () => {
        const addresses = [...this.state.addresses];
        addresses.splice(idx, 1);
        this.setState({ addresses })
    };

    handleRowChange = idx => e => {

        const { name, value } = e.target;
        const addresses = [...this.state.addresses];
        addresses[idx] = {
            ...addresses[idx],
            [name]: value.toUpperCase()
        };
        this.setState({
            addresses
        });

    };

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value.toUpperCase()
        });
    };

    clearPatientDetails = () => {
        this.setState({
            firstName: '',
            lastName: '',
            contactNumber: '',
            addresses: [],
            selectedUserId:"",
        });
    };

    handleDelete = () => {
        confirmAlert({
            title: 'Delete Patient',
            message: 'How to do want to handle the patient deletion.',
            buttons: [
                {
                    label: 'Safe Delete',
                    onClick: async() => {
                        var idToken = await firebase.auth().currentUser.getIdToken(true);
                        const payload = "";
                        axios.put(API_ROOT+'/patients/safe-delete/'+this.state.selectedUserId,payload,
                            {
                                headers: {
                                    Authorization: idToken
                                }
                            })
                            .then((response) => {
                                this.handleCloseModal();
                                this.getPatients();
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                    }
                },
                {
                    label: 'Delete',
                    onClick: async() => {
                        var idToken = await firebase.auth().currentUser.getIdToken(true);
                        axios.delete(API_ROOT+'/patients/'+this.state.selectedUserId,
                            {
                                headers: {
                                    Authorization: idToken
                                }
                            })
                            .then((response) => {
                                this.handleCloseModal();
                                this.getPatients();
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                    }
                },
                {
                    label: 'Close'
                }
            ]
        })
    };

    handleSubmit = async() => {
        const {firstName, lastName, contactNumber, addresses, active} = this.state;

        if (!(firstName && lastName)) {
            alert("Please input first and last name");
            return;
        }

        const payload = {
            firstName,
            lastName,
            contactNumber,
            addresses,
            active
        };
        var idToken = await firebase.auth().currentUser.getIdToken(true);

        if (this.state.editMode === "Add") {
            axios.post(API_ROOT+'/patients', payload,
                {
                    headers: {
                        Authorization: idToken
                    }
                })
                .then((response) => {
                    this.handleCloseModal();
                    this.getPatients();
                })
                .catch(function (error) {
                    console.log(error);
                });
        } else {
            axios.put(API_ROOT+'/patients/' + this.state.selectedUserId, payload,
                {
                    headers: {
                        Authorization: idToken
                    }
                })
                .then((response) => {
                    this.handleCloseModal();
                    this.getPatients();
                })
                .catch(function (error) {
                    console.log(error);
                });
        }

    };

    fetchData = (state, instance) => {
        // show the loading overlay
        this.setState({loading: true, page: state.page, pageSize: state.pageSize}, this.getPatients);
    };

    getPatients = async(searchQ) => {
        var idToken = await firebase.auth().currentUser.getIdToken(true);

        axios.get(API_ROOT+'/patients', {
            headers: {
                Authorization: idToken
            },
            params:{
                page: this.state.page,
                size: this.state.pageSize,
                sort: 'firstName.keyword',
                q: searchQ
            }
        }).then((res) => {
            // Update react-table
            this.setState({
                patients: res.data.content.filter((patient) => {
                    if (this.state.activeFilter === "ALL") {
                        return true;
                    } else {
                        var isFilterActive = this.state.activeFilter === "TRUE";
                        return patient.active === isFilterActive;
                    }
                }),
                loading: false,
                pages: res.data.totalPages
            })
        }).catch(function(error) {
            console.log(error);
        });
    };

    render() {

        const columns = [{
            id: 'firstName',
            Header: 'First Name',
            accessor: d => d.firstName
        },{
            id: 'lastName',
            Header: 'Last Name',
            accessor: d => d.lastName
        },{
            id: 'contactNumber',
            Header: 'Contact Number',
            accessor: d => d.contactNumber
        },{
            id: 'active',
            Header: 'Active',
            accessor: d => d.active.toString()
        }];

        return (
            <div className='app'>
                <header>
                    <div className='wrapper'>
                        <h1>Patient Directory</h1>
                        {this.state.user ?
                            <button onClick={this.logout}>Log Out</button>
                            :
                            <button onClick={this.login}>Log In</button>
                        }
                    </div>
                </header>
                {this.state.user ?
                    <div>
                        <div className='user-profile'>
                            <img src={this.state.user.photoURL} />
                        </div>
                        <div className='container'>
                            <button className="add-patient-btn" onClick={() => this.handleOpenModal("Add")}>Add Patient</button>
                            <section className='display-item'>
                                <div className="wrapper">
                                    <div className="search-box">
                                        <input type="text" name="searchQ" placeholder="Search..." onChange={this.handleChange} value={this.state.searchQ} />
                                        <select
                                            name={"activeFilter"}
                                            onChange={this.handleChange}
                                            value={this.state.activeFilter ? this.state.activeFilter : "all"}
                                        >
                                            <option value="ALL">Show All</option>
                                            <option value="TRUE">Active Only</option>
                                            <option value="FALSE">Inactive Only</option>
                                        </select>
                                        <button onClick={this.searchPatients}>Search</button>
                                    </div>
                                    <ReactTable
                                        sortable={false}
                                        data={this.state.patients}
                                        columns={columns}
                                        manual
                                        defaultPageSize={10}
                                        pages={this.state.pages}
                                        className="-striped -highlight"
                                        onFetchData={this.fetchData}
                                        getTdProps={this.selectPatient}
                                    />
                                </div>
                            </section>

                            <ReactModal
                                isOpen={this.state.showModal}
                                contentLabel="Add Patient"
                                className="add-item"
                            >
                                <div className="row">
                                    <div className="column-1">
                                        <div className="form">
                                            <input type="text" name="firstName" placeholder="First Name" onChange={this.handleChange} value={this.state.firstName} />
                                            <input type="text" name="lastName" placeholder="Last Name" onChange={this.handleChange} value={this.state.lastName}/>
                                            <input type="text" name="contactNumber" placeholder="Contact Number" onChange={this.handleChange} value={this.state.contactNumber}/>
                                            <div className="container">
                                                <div className="row clearfix">
                                                    <table
                                                        className="table table-bordered table-hover"
                                                        id="tab_logic"
                                                    >
                                                        <thead>
                                                        <tr>
                                                            <th className="text-center"> # </th>
                                                            <th className="text-center"> Address1 </th>
                                                            <th className="text-center"> Address2 </th>
                                                            <th className="text-center"> City </th>
                                                            <th className="text-center"> Country </th>
                                                            <th className="text-center"> Postal </th>
                                                            <th />
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {this.state.addresses && this.state.addresses.map((address, idx) => (
                                                            <tr id="addr0" key={idx}>
                                                                <td>{idx}</td>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        name="addressLine1"
                                                                        value={this.state.addresses[idx].addressLine1}
                                                                        onChange={this.handleRowChange(idx)}
                                                                        className="form-control"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        name="addressLine2"
                                                                        value={this.state.addresses[idx].addressLine2}
                                                                        onChange={this.handleRowChange(idx)}
                                                                        className="form-control"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        name="city"
                                                                        value={this.state.addresses[idx].city}
                                                                        onChange={this.handleRowChange(idx)}
                                                                        className="form-control"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        name="country"
                                                                        value={this.state.addresses[idx].country}
                                                                        onChange={this.handleRowChange(idx)}
                                                                        className="form-control"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <input
                                                                        type="text"
                                                                        name="postalCode"
                                                                        value={this.state.addresses[idx].postalCode}
                                                                        onChange={this.handleRowChange(idx)}
                                                                        className="form-control"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <button
                                                                        className="btn btn-outline-danger"
                                                                        onClick={this.handleRemoveSpecificRow(idx)}
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="column-2">

                                        <PlacesAutocomplete
                                            value={this.state.address}
                                            onChange={(address)=>this.setState({ address })}
                                            onSelect={this.handleSelect}
                                        >
                                            {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                                                <div className="form">
                                                    <input
                                                        {...getInputProps({
                                                            placeholder: 'Search Places ...',
                                                            className: 'location-search-input'
                                                        })}
                                                    />
                                                    <div className="autocomplete-dropdown-container">
                                                        {suggestions.map(suggestion => {
                                                            const className = suggestion.active ? 'suggestion-item--active' : 'suggestion-item';
                                                            // inline style for demonstration purpose
                                                            const style = suggestion.active
                                                                ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                                                : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                                            return (
                                                                <div {...getSuggestionItemProps(suggestion, { className, style })}>
                                                                    <span>{suggestion.description}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </PlacesAutocomplete>

                                        <div className="form">
                                            <input type="text" name="addressLine1" placeholder="Address Line 1" onChange={this.handleChange} value={this.state.addressLine1} />
                                            <input type="text" name="addressLine2" placeholder="Address Line 2" onChange={this.handleChange} value={this.state.addressLine2}/>
                                            <input type="text" name="city" placeholder="City" onChange={this.handleChange} value={this.state.city} />
                                            <input type="text" name="country" placeholder="Country" onChange={this.handleChange} value={this.state.country}/>
                                            <input type="text" name="postalCode" placeholder="Postal Code" onChange={this.handleChange} value={this.state.postalCode}/>
                                            <button onClick={this.addAddress}>Add Address</button>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={this.handleSubmit}>{this.state.editMode} Patient</button>
                                {this.state.editMode === "Edit" ? <button onClick={this.handleDelete}>Delete(Safe/Permanent) Patient</button> : null}
                                <button onClick={this.handleCloseModal}>Close</button>
                            </ReactModal>

                        </div>
                    </div>
                    :
                    <div className='wrapper'>
                        <p>You must be logged in to use Patient Directory App.</p>
                    </div>
                }
            </div>
        );
    }
}
export default App;