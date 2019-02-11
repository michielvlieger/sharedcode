import React, {Component} from 'react';
import axios from 'axios';
import Companylistitem from '../components/companies/Companylistitem';
import Companycreate from '../components/companies/Companycreate';
import Pagination from 'react-js-pagination';
import {Input, Table} from 'reactstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSort} from '@fortawesome/free-solid-svg-icons';
import {faSortDown} from '@fortawesome/free-solid-svg-icons';
import {faSortUp} from '@fortawesome/free-solid-svg-icons';

export default class Companylist extends Component {
    constructor() {
        super();
        this.state = {
            companies: [],
            activePage: 1,
            itemsCountPerPage: 25,
            totalItemsCount: 1,
            formVisibility: false,
            errors: [],
            name: '',
            legal_form_id: '',
            progression_id: '',
            region: '',
            city: '',
            establishment_date: '',
            company_priority: '',
            alllegalforms: undefined,
            allprogressions: undefined,
            orderby: 'created_at',
            orderway: 'desc'
        };
        this.handleChange = this.handleChange.bind(this);
        this.handlePriorityChange = this.handlePriorityChange.bind(this);
        this.handleRegFormChange = this.handleRegFormChange.bind(this);
        this.companyCreate = this.companyCreate.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.isSet = this.isSet.bind(this);
        this.orderBy = this.orderBy.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentDidMount() {
        axios.all([
            axios.get('uri for companies', {
                headers: {
                    Authorization: 'Bearer ' + sessionStorage.getItem('JWT_token')
                }
            }),
            axios.get('uri for legalforms', {
                headers: {
                    Authorization: 'Bearer ' + sessionStorage.getItem('JWT_token')
                }
            }),
            axios.get('uri for progressions', {
                headers: {
                    Authorization: 'Bearer ' + sessionStorage.getItem('JWT_token')
                }
            })
        ]).then(response => {
                this.setState({
                    activePage: response[0].data.current_page,
                    companies: response[0].data.data,
                    itemCountPerPage: response[0].data.per_page,
                    totalItemsCount: response[0].data.total,
                    alllegalforms: response[1].data,
                    allprogressions: response[2].data
                })
            }
        )
    }

    handleDelete(companyID, companyName) {
        let c = confirm("Weet je zeker dat je " + companyName + " wilt verwijderen");
        if (c === true) {
            axios.delete('uro for company delete' + companyID, {
                headers: {
                    Authorization: 'Bearer ' + sessionStorage.getItem('JWT_token')
                }
            }).then(response => {
                console.log(response.data);
                this.handleChange(this.state.activePage)
            });
            this.handleChange(this.state.activePage);
        }
    }

    handleRegFormChange() {
        this.setState({
            formVisibility: !this.state.formVisibility
        });
    }

    handlePriorityChange(companyID) {
        axios.put('uri for changing priority' + companyID, null, {
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('JWT_token')
            }
        })
            .then(response => {
                console.log(response.data);
                this.handleChange(this.state.activePage)
            });
        this.handleChange(this.state.activePage);
    }

    handleInputChange(e) {
        const target = e.target;
        const value = target.value;
        const id = target.id;
        this.setState({
            [id]: value
        }, () => this.handleChange(this.state.activePage));
    }

    handleSelect(e) {
        const name = e.target.name;
        const value = this.refs[name].value;
        this.setState({
            [name]: value
        }, () => this.handleChange(this.state.activePage));
    }

    companyCreate(newcompany) {
        axios.post('uri for creating companies', newcompany, {
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('JWT_token')
            }
        })
            .then(response => {
                console.log('from handle submit', response);
                this.handleRegFormChange();
                this.setState({
                    errors: []
                });
                this.handleChange(this.state.activePage);
            })
            .catch(error => {
                console.log('error: ', error.response);
                this.setState({
                    errors: error.response.data.errors
                })
            });
    }

    orderBy(key) {
        if (key !== this.state.orderby) {
            this.setState({
                orderby: key,
                orderway: 'asc'
            }, () => this.handleChange(this.state.activePage))
        } else {
            switch (this.state.orderway) {
                case 'asc':
                    this.setState({
                        orderway: 'desc'
                    }, () => this.handleChange(this.state.activePage));
                    break;
                case 'desc':
                    this.setState({
                        orderby: 'created_at',
                        orderway: 'desc'
                    }, () => this.handleChange(this.state.activePage));
                    break;
            }
        }
    }

    isSet(variable) {
        return (variable !== '' && variable !== undefined);
    }

    async handleChange(pageNumber) {
        let url = ('uri for getting all companies?page=' + pageNumber + '&paginationamount=' + this.refs.itemsCountPerPageSelector.value);
        const states = ['name', 'legal_form_id', 'progression_id', 'region', 'city', 'establishment_date', 'company_priority'];
        for (let state of states) {
            if (this.isSet(this.state[state])) {
                url += ('&' + state + '=' + this.state[state])
            }
        }
        url += ('&orderby=' + this.state.orderby + '&orderway=' + this.state.orderway);
        axios.get(url, {
            headers: {
                Authorization: 'Bearer ' + sessionStorage.getItem('JWT_token')
            }
        })
            .then(response => {
                console.log(response);
                this.setState({
                    activePage: response.data.allcompanies.current_page,
                    companies: response.data.allcompanies.data,
                    itemCountPerPage: response.data.allcompanies.per_page,
                    totalItemsCount: response.data.allcompanies.total,
                });
            });
    }

    render() {
        let legalformoptions = undefined;
        if (this.isSet(this.state.alllegalforms)) {
            legalformoptions = this.state.alllegalforms.map((legalform) =>
                <option key={legalform.ID} value={legalform.ID}>{legalform.legal_form_name}</option>
            );
        }
        let progressionoptions = undefined;
        if (this.isSet(this.state.allprogressions)) {
            progressionoptions = this.state.allprogressions.map((progression) =>
                <option key={progression.ID} value={progression.ID}>{progression.progression_name}</option>
            );
        }

        let minitem = this.state.itemCountPerPage * this.state.activePage - this.state.itemCountPerPage + 1;
        let maxitem = this.state.itemCountPerPage * this.state.activePage;
        if (maxitem > this.state.totalItemsCount) {
            maxitem = this.state.totalItemsCount;
        }

        let orderarrow = null;
        if (this.state.orderway === 'asc') {
            orderarrow = <FontAwesomeIcon icon={faSortUp}/>
        } else {
            orderarrow = <FontAwesomeIcon icon={faSortDown}/>
        }

        return (
            <div className="container">
                <div style={{marginBottom: "10px", marginTop: "10px"}} className="col text-center">
                    <button className="btn btn-success" onClick={this.handleRegFormChange}>
                        Voeg bedrijf toe
                    </button>
                </div>

                {this.state.formVisibility ?
                    <Companycreate errors={this.state.errors} companycreate={this.companyCreate}/> : null}

                <h2>Alle bedrijven</h2>
                <Table striped bordered hover responsive>
                    <thead>
                    <tr>
                        <th><span style={{'cursor': 'pointer'}}
                                  onClick={() => this.orderBy('name')}>Bedrijf naam{this.state.orderby === 'name' ? orderarrow :
                            <FontAwesomeIcon icon={faSort}/>}</span><Input type="search"
                                                                           name="nameSearch"
                                                                           id="name"
                                                                           onChange={this.handleInputChange}/>
                        </th>

                        <th><span style={{'cursor': 'pointer'}}
                                  onClick={() => this.orderBy('legal_form_id')}>Rechtsvorm{this.state.orderby === 'legal_form_id' ? orderarrow :
                            <FontAwesomeIcon icon={faSort}/>}</span>
                            <select className="form-control" id="legal_form_id" name="legal_form_id"
                                    ref="legal_form_id" value={this.state.legal_form_id}
                                    onChange={this.handleSelect}>
                                <option value="">selecteer een rechtsvorm</option>
                                {legalformoptions}
                            </select>
                        </th>

                        <th><span style={{'cursor': 'pointer'}}
                                  onClick={() => this.orderBy('region')}>Provincie{this.state.orderby === 'region' ? orderarrow :
                            <FontAwesomeIcon icon={faSort}/>}</span> <Input type="search"
                                                                            name="regionSearch"
                                                                            id="region"
                                                                            onChange={this.handleInputChange}/>
                        </th>

                        <th><span style={{'cursor': 'pointer'}}
                                  onClick={() => this.orderBy('city')}>Plaats{this.state.orderby === 'city' ? orderarrow :
                            <FontAwesomeIcon icon={faSort}/>}</span> <Input type="search"
                                                                            name="citySearch" id="city"
                                                                            onChange={this.handleInputChange}/>
                        </th>
                        <th><span style={{'cursor': 'pointer'}}
                                  onClick={() => this.orderBy('establishment_date')}>Vestigingsdatum{this.state.orderby === 'establishment_date' ? orderarrow :
                            <FontAwesomeIcon icon={faSort}/>}</span> <Input type="date"
                                                                            name="dateSearch" id="establishment_date"
                                                                            onChange={this.handleInputChange}/>
                        </th>

                        <th><span style={{'cursor': 'pointer'}}
                                  onClick={() => this.orderBy('progression_id')}>Progressie{this.state.orderby === 'progression_id' ? orderarrow :
                            <FontAwesomeIcon icon={faSort}/>}</span>
                            <select className="form-control" id="progression_id" name="progression_id"
                                    ref="progression_id" value={this.state.progression_id}
                                    onChange={this.handleSelect}>
                                <option value="">selecteer een progressie</option>
                                {progressionoptions}
                            </select>
                        </th>

                        <th><span style={{'cursor': 'pointer'}}
                                  onClick={() => this.orderBy('company_priority')}>Prioriteit{this.state.orderby === 'company_priority' ? orderarrow :
                            <FontAwesomeIcon icon={faSort}/>}</span>
                            <select className="form-control" id="company_priority" name="company_priority"
                                    ref="company_priority" value={this.state.company_priority}
                                    onChange={this.handleSelect}>
                                <option value="">selecteer een prioriteit</option>
                                <option value="0">geen prioriteit</option>
                                <option value="1">prioriteit</option>

                            </select>
                        </th>
                        <th>Delete</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.companies.map(company => {
                            return (
                                <Companylistitem key={company.ID} company={company}
                                                 handlePriorityChange={this.handlePriorityChange}
                                                 handleDelete={this.handleDelete}/>
                            )
                        })

                    }
                    </tbody>
                </Table>

                <div className="d-flex justify-content-center">
                    <Pagination
                        activePage={this.state.activePage}
                        itemsCountPerPage={this.state.itemCountPerPage}
                        totalItemsCount={this.state.totalItemsCount}
                        pageRangeDisplayed='5'
                        onChange={this.handleChange}
                        itemClass='page-item'
                        linkClass='page-link'
                    />
                </div>

                <div className="row">
                    <div className="col-md-4">
                        <form method="get">
                            <div className="form-group row">
                                <label htmlFor="paginationamount" className="col-md-6 col-form-label">resultaten per
                                    pagina:</label>
                                <div className="col">
                                    <select className="form-control" id="paginationamount" name="paginationamount"
                                            ref="itemsCountPerPageSelector" value={this.state.itemCountPerPage}
                                            onChange={this.handleChange}>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="15">15</option>
                                        <option value="25">25</option>
                                        <option value="30">30</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="col-md-2 ml-auto text-right">
                        <p>{minitem !== maxitem ? minitem + ' - ' + maxitem : maxitem} van {this.state.totalItemsCount} resultaten</p>
                    </div>
                </div>
            </div>
        );
    }
}
