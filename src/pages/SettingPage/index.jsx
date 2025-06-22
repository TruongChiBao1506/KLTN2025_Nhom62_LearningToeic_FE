import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faClock, faChartBar } from '@fortawesome/free-solid-svg-icons';
import './style.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('system');
    const [searchValue, setSearchValue] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [valueType, setValueType] = useState('USD');
    const [amount, setAmount] = useState('');

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    const handleInsert = () => {
        console.log('Inserting:', { valueType, amount });
        // Handle insert logic here
    };

    const systemSettings = [
        {
            title: "login attempts",
            description: "number of user login attempts"
        },
        {
            title: "customer spend 24h", 
            description: "amount customer has spent in the past 24h"
        },
        {
            title: "device id is on blacklist",
            description: "check if a users device id is on a blacklist"
        },
        {
            title: "card country",
            description: "credit card issue country"
        }
    ];

    return (
        <div className="settings-container">
            <div className="card shadow d-flex justify-content-center mt-3">
                {/* Nav options */}
                <ul className="nav nav-pills mb-3 shadow-sm" id="pills-tab" role="tablist">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'system' ? 'active' : ''}`}
                            onClick={() => handleTabClick('system')}
                            type="button"
                        >
                            <FontAwesomeIcon icon={faCog} className="me-2" />
                            Cài đặt hệ thống
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'datetime' ? 'active' : ''}`}
                            onClick={() => handleTabClick('datetime')}
                            type="button"
                        >
                            <FontAwesomeIcon icon={faClock} className="me-2" />
                            Quản lý ngày giờ
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'score' ? 'active' : ''}`}
                            onClick={() => handleTabClick('score')}
                            type="button"
                        >
                            <FontAwesomeIcon icon={faChartBar} className="me-2" />
                            Bảng điểm TOEIC
                        </button>
                    </li>
                </ul>

                {/* Content */}
                <div className="tab-content p-3" id="pills-tabContent">
                    {/* 1st tab - System Settings */}
                    <div 
                        className={`tab-pane fade ${activeTab === 'system' ? 'show active' : ''}`}
                        role="tabpanel"
                    >
                        <form className="search">
                            <input 
                                className="form-control mr-sm-2" 
                                type="search" 
                                placeholder="Search" 
                                aria-label="Search..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </form>
                        <ul className="ccontent">
                            {systemSettings
                                .filter(setting => 
                                    setting.title.toLowerCase().includes(searchValue.toLowerCase()) ||
                                    setting.description.toLowerCase().includes(searchValue.toLowerCase())
                                )
                                .map((setting, index) => (
                                    <li key={index}>
                                        <div className="wrapp">
                                            <div>{setting.title}</div>
                                            <p>{setting.description}</p>
                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>

                    {/* 2nd tab - DateTime Management */}
                    <div 
                        className={`tab-pane fade ${activeTab === 'datetime' ? 'show active' : ''}`}
                        role="tabpanel"
                    >
                        <div className="form-group addinfo">
                            <label htmlFor="additionalInfo">Write additional info.</label>
                            <textarea 
                                className="form-control" 
                                id="additionalInfo" 
                                rows="3"
                                value={additionalInfo}
                                onChange={(e) => setAdditionalInfo(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 3rd tab - TOEIC Score */}
                    <div 
                        className={`tab-pane fade third ${activeTab === 'score' ? 'show active' : ''}`}
                        role="tabpanel"
                    >
                        <div className="form">
                            <div className="form-group">
                                <label htmlFor="valueType">
                                    Value Type
                                    <span>i</span>
                                </label>
                                <select 
                                    className="form-control round" 
                                    id="valueType"
                                    value={valueType}
                                    onChange={(e) => setValueType(e.target.value)}
                                >
                                    <option value="USD">United States Dollar</option>
                                    <option value="INR">Indian Rupees</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="amount">amount</label>
                                <input 
                                    className="form-control amount" 
                                    id="amount"
                                    placeholder="1500"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                            <button 
                                className="btn btn-success"
                                type="button"
                                onClick={handleInsert}
                            >
                                Insert
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;