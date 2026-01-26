import React, { useState, useEffect } from 'react';
import './PromisesPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function PromisesPage() {
  const [promises, setPromises] = useState([]);
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [schemaFilter, setSchemaFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSchemas();
    // For demo, we'll fetch some promises from integrity endpoint
    // In production, there would be a /promise/events endpoint
    fetchPromises();
  }, []);

  const fetchSchemas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/promise/schemas`);
      const data = await response.json();

      if (data.success) {
        setSchemas(data.schemas);
      }
    } catch (err) {
      console.error('Failed to load schemas:', err);
    }
  };

  const fetchPromises = async () => {
    try {
      setLoading(true);
      setError(null);

      // For demo purposes, we create mock promise data
      // In production, this would fetch from /api/v1/promise/events endpoint
      const mockPromises = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          schema_id: 'codec.grind_roast_compatibility',
          promiser: { type: 'platform', id: 'codec' },
          promisee: { type: 'user', id: 'customer_001' },
          input_context: { roast: 'espresso', grind: 'fine' },
          result: 'kept',
          violation: null,
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          schema_id: 'codec.grind_roast_compatibility',
          promiser: { type: 'platform', id: 'codec' },
          promisee: { type: 'user', id: 'customer_002' },
          input_context: { roast: 'espresso', grind: 'french_press' },
          result: 'broken',
          violation: 'grind=french_press not compatible with roast=espresso',
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          schema_id: 'codec.grind_roast_compatibility',
          promiser: { type: 'platform', id: 'codec' },
          promisee: { type: 'user', id: 'customer_003' },
          input_context: { roast: 'light', grind: 'medium' },
          result: 'kept',
          violation: null,
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
          schema_id: 'codec.grind_roast_compatibility',
          promiser: { type: 'platform', id: 'codec' },
          promisee: { type: 'user', id: 'customer_004' },
          input_context: { roast: 'french', grind: 'extra-fine' },
          result: 'broken',
          violation: 'grind=extra-fine not compatible with roast=french',
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
          schema_id: 'codec.grind_roast_compatibility',
          promiser: { type: 'platform', id: 'codec' },
          promisee: { type: 'user', id: 'customer_005' },
          input_context: { roast: 'medium', grind: 'medium' },
          result: 'kept',
          violation: null,
        },
      ];

      setPromises(mockPromises);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getResultBadgeClass = (result) => {
    switch (result) {
      case 'kept':
        return 'badge-kept';
      case 'broken':
        return 'badge-broken';
      case 'pending':
        return 'badge-pending';
      case 'blocked':
        return 'badge-blocked';
      case 'renegotiated':
        return 'badge-renegotiated';
      default:
        return '';
    }
  };

  const filteredPromises = promises.filter((promise) => {
    // Schema filter
    if (schemaFilter !== 'all' && promise.schema_id !== schemaFilter) {
      return false;
    }

    // Result filter
    if (resultFilter !== 'all' && promise.result !== resultFilter) {
      return false;
    }

    // Search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSchema = promise.schema_id.toLowerCase().includes(searchLower);
      const matchesPromisee = promise.promisee.id.toLowerCase().includes(searchLower);
      const matchesContext = JSON.stringify(promise.input_context)
        .toLowerCase()
        .includes(searchLower);

      if (!matchesSchema && !matchesPromisee && !matchesContext) {
        return false;
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className="promises-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading promises...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="promises-page">
        <div className="error-box">
          <h3>Error Loading Promises</h3>
          <p>{error}</p>
          <button onClick={fetchPromises}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="promises-page">
      {/* Header */}
      <div className="page-header">
        <h1>Promise History</h1>
        <p className="page-description">
          Browse all promise verifications. Every kept or broken promise is logged here.
        </p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by schema, user, or context..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>Schema</label>
          <select
            value={schemaFilter}
            onChange={(e) => setSchemaFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Schemas</option>
            {schemas.map((schema) => (
              <option key={schema.id} value={schema.id}>
                {schema.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Result</label>
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Results</option>
            <option value="kept">Kept</option>
            <option value="broken">Broken</option>
            <option value="pending">Pending</option>
            <option value="blocked">Blocked</option>
            <option value="renegotiated">Renegotiated</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="results-info">
        Showing {filteredPromises.length} of {promises.length} promises
      </div>

      {/* Promises Table */}
      {filteredPromises.length === 0 ? (
        <div className="empty-state">
          <p>No promises match your filters</p>
        </div>
      ) : (
        <div className="promises-table">
          <div className="table-header">
            <div className="col-timestamp">Timestamp</div>
            <div className="col-schema">Schema</div>
            <div className="col-promisee">Promisee</div>
            <div className="col-context">Context</div>
            <div className="col-result">Result</div>
          </div>

          {filteredPromises.map((promise) => (
            <div key={promise.id} className="table-row">
              <div className="col-timestamp">
                {new Date(promise.timestamp).toLocaleString()}
              </div>

              <div className="col-schema">
                <div className="schema-name">{promise.schema_id}</div>
              </div>

              <div className="col-promisee">
                <span className="agent-badge">
                  {promise.promisee.type}:{promise.promisee.id}
                </span>
              </div>

              <div className="col-context">
                <div className="context-box">
                  {Object.entries(promise.input_context).map(([key, value]) => (
                    <div key={key} className="context-item">
                      <span className="context-key">{key}:</span>{' '}
                      <span className="context-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-result">
                <span className={`result-badge ${getResultBadgeClass(promise.result)}`}>
                  {promise.result}
                </span>
                {promise.violation && (
                  <div className="violation-note">{promise.violation}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PromisesPage;
