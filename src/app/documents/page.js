'use client';

import { Breadcrumb, BreadcrumbItem, Button, Column, FileUploaderDropContainer, FileUploaderItem, Grid, SkeletonText, TextInput, ToastNotification } from '@carbon/react';

import React, { useState } from 'react';
import { Octokit } from '@octokit/core';
import DocumentMap from './DocumentMap';
import { Add, Search } from '@carbon/react/icons';

const octokitClient = new Octokit({});

function DocumentsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [file, setFile] = useState();
  const [query, setQuery] = useState('');
  const [empty, setEmpty] = useState(false);
  const [rows, setRows] = useState([]);

  const [open, setOpen] = useState(false);

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

  const searchDocuments = () => {
    if (!query) {
      setEmpty(true);
      return;
    }

    setLoading(true);
    getDocuments();
  }

  const updateFile = (event) => {
    const file0 = event.target.files[0];
    if (file0) {
      setFile(file0);
    };
  }

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append('myFile', file);
    formData.append('name', file.name);
    formData.append('description', 'to be added');
    formData.append('type', 'text');
    formData.append('file_name', file.name);

    try {
      const response = await fetch('http://localhost:8000/api/v1/a/documents/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Upload successful');
        const responseBody = await response.json();
        console.log('Response Body:', responseBody);

      } else {
        console.error('Upload failed', response.statusText);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  }

  const uploadFile2 = async () => {
    if (!file) {
      setError('No file selected');
      return;
    }

    const formData = new FormData();
    const blob = new Blob([fileContent], { type: contentType });

    formData.append('myFile', file, {
      contentType,
      filename: file.name,
    });
    formData.append('name', file.name);
    formData.append('description', '');
    formData.append('type', 'text');
    formData.append('file_name', file.name);
    //formData.append('file_base_uri', '');

    for (let [key, value] of formData.entries()) {
      if (key === 'myFile') {
        console.log(`${key}:`, JSON.stringify(value.name, 0, 2), value.type);
      }
      console.log(`${key}:`, value);
    }

    try {
      const res = await octokitClient.request('POST http://localhost:8000/api/v1/a/documents/', {
        body: formData,
      });

      if (res.status === 201) {
        console.log('Document uploaded', res.data);
        searchDocuments();
      } else {
        setError('Error uploading document (' + res.status + ')');
      }
    } catch (error) {
      setError('Error uploading document:' + error.message);
      console.error('Error uploading document:' + error.message);
    }
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

      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <FileUploaderDropContainer name="fileUploader"
          labelText="Drag and drop files here or click to upload"
          multiple={false}
          accept={['text/plain', 'text/html', 'text/markdown', 'application/pdf']}
          onAddFiles={updateFile} />
        {file && <FileUploaderItem name={file.name} status="edit"
          iconDescription="Delete file"
          onDelete={() => setFile()}
          errorBody="500kb max file size. Select a new file and try again."
          errorSubject="File size exceeds limit" invalid={false} />}

        <Button renderIcon={Add} iconDescription="Add Document" onClick={() => uploadFile()}>Add Document</Button>
      </Column>

      <Column lg={16} md={8} sm={4}>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }} />
        <TextInput data-modal-primary-focus id="text-input-1"
          labelText="Query"
          placeholder="e.g. loan validation"
          invalid={empty}
          invalidText="This field cannot be empty"
          value={query}
          onChange={(e) => { setEmpty(!e.target.value); setQuery(e.target.value.trim()) }} />
        <Button renderIcon={Search} disabled={empty} iconDescription="Search" onClick={() => searchDocuments()}>Search</Button>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }} />
      </Column>

      {loading && (
        <Column lg={3} md={2} sm={2}>
          <SkeletonText className="card" paragraph={true} lineCount={2} />
        </Column>
      )}

      {!loading && (<DocumentMap rows={rows} />)}

      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        {error && (<ToastNotification role="alert" caption={error} timeout={3000} title="Error" subtitle="" />)}
      </Column>
    </Grid>
  );
}

export default DocumentsPage;
