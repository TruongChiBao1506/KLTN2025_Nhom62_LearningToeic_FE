import React from 'react';
import BlogList from './index';

const TestBlogList = () => {
    // Test data with different response formats
    const testScenarios = [
        {
            name: "Empty array",
            data: []
        },
        {
            name: "Direct array",
            data: [
                {
                    id: 1,
                    title: "Test Blog 1",
                    category: "tips",
                    content: "This is test content for blog 1",
                    status: "published",
                    tags: ["toeic", "tips", "study"],
                    createdAt: "2024-01-15T10:30:00Z",
                    updatedAt: "2024-01-15T10:30:00Z"
                },
                {
                    id: 2,
                    title: "Test Blog 2 - Draft",
                    category: "grammar",
                    content: "",
                    status: "draft",
                    tags: ["grammar", "english"],
                    createdAt: "2024-01-16T09:15:00Z",
                    updatedAt: "2024-01-16T09:15:00Z"
                }
            ]
        },
        {
            name: "Object with data property",
            data: {
                data: [
                    {
                        id: 3,
                        title: "Test Blog 3 - AI Generating",
                        category: "tips",
                        content: "",
                        status: "generating",
                        generationStatus: "processing",
                        tags: ["ai", "study", "guide"],
                        createdAt: "2024-01-17T14:20:00Z",
                        updatedAt: "2024-01-17T14:20:00Z"
                    }
                ]
            }
        },
        {
            name: "Object with blogs property",
            data: {
                blogs: [
                    {
                        id: 4,
                        title: "Test Blog 4 - Multiple Tags",
                        category: "vocabulary",
                        content: "This blog has many tags to test the tag display functionality.",
                        status: "published",
                        tags: ["vocabulary", "words", "learning", "toeic", "english", "study"],
                        createdAt: "2024-01-18T11:45:00Z",
                        updatedAt: "2024-01-18T11:45:00Z"
                    }
                ]
            }
        },
        {
            name: "Non-array response",
            data: {
                message: "Some other response format"
            }
        }
    ];

    const mockRetrieveBlogs = () => {
        console.log('Mock retrieveBlogs called');
    };

    return (
        <div className="container-fluid py-4">
            <h2>BlogList Component Test Cases</h2>
            <p>Testing different data formats that might come from the API:</p>
            
            {testScenarios.map((scenario, index) => (
                <div key={index} className="mb-5">
                    <h4 className="text-primary">Scenario {index + 1}: {scenario.name}</h4>
                    <div className="bg-light p-3 rounded mb-3">
                        <strong>Data Format:</strong>
                        <pre className="mt-2" style={{ fontSize: '12px', maxHeight: '150px', overflow: 'auto' }}>
                            {JSON.stringify(scenario.data, null, 2)}
                        </pre>
                    </div>
                    <div className="border p-3 rounded">
                        <BlogList 
                            blogs={scenario.data} 
                            retrieveBlogs={mockRetrieveBlogs}
                        />
                    </div>
                    <hr className="my-4" />
                </div>
            ))}
        </div>
    );
};

export default TestBlogList;