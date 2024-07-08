'use client';

import { Breadcrumb, BreadcrumbItem, Column, Grid, SkeletonText, ToastNotification } from '@carbon/react';

import React, { useEffect, useState } from 'react';
import { Octokit } from '@octokit/core';
import DocumentMap from './DocumentMap';

const octokitClient = new Octokit({});

function DocumentsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState([]);

  const getDocuments = async () => {
    try {
      const res = await octokitClient.request('GET http://localhost:8000/api/v1/a/documents/' + query);

      if (res.status === 200) {
        setRows(res.data);
      } else {
        setError('Error when querying documents (' + res.status + ')');
      }
    } catch (error) {
      setError('Error when querying documents:' + error.message);
      console.error('Error when querying documents:' + error.message);
    }
    setLoading(false);
  }

  return (
    <Grid>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation">
          <BreadcrumbItem>
            <a href="/">Manage intelligent decision with Hybrid AI</a>
          </BreadcrumbItem>
        </Breadcrumb>
        <h1 className="landing-page__heading">Documents</h1>
      </Column>

      {loading && (
        <Column lg={3} md={2} sm={2}>
          <SkeletonText className="card" paragraph={true} lineCount={2} />
        </Column>
      )}

      <TextInput data-modal-primary-focus id="text-input-1"
        labelText="Assistant name"
        placeholder="e.g. IBU new assistant"
        invalid={empty}
        invalidText="This field cannot be empty"
        value={assistantName}
        onChange={(e) => { setEmpty(!e.target.value); setAssistantName(e.target.value) }} />
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }} />

      {!loading && (<DocumentMap rows={rows} />)}

      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        {error && (<ToastNotification role="alert" caption={error} timeout={3000} title="Error" subtitle="" />)}
      </Column>
    </Grid>
  );
}

export default DocumentsPage;
