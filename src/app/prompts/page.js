'use client';

import { Breadcrumb, BreadcrumbItem, Button, Column, Grid, SkeletonText, ToastNotification } from '@carbon/react';

import React, { useEffect, useState } from 'react';
import { Octokit } from '@octokit/core';
import PromptMap from './PromptMap';
import { Add } from '@carbon/react/icons';
import Prompt from './Prompt';

const octokitClient = new Octokit({});

function PromptsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [rows, setRows] = useState([]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    getPrompts();
  }, []);

  const getPrompts = async () => {
    if (!window._env_) {
      var script = document.createElement("script");
      script.src = "../env-config.js";
      script.async = true;
      document.head.appendChild(script);
    }
    const serverUrl = window._env_.REACT_APP_BACKEND_URL;
    try {
      const res = await octokitClient.request(
        `GET ${serverUrl}a/prompts`);

      if (res.status === 200) {
        setRows(res.data);
      } else {
        setError('Error obtaining prompt data (' + res.status + ')');
      }
    } catch (error) {
      setError('Error obtaining prompt data:' + error.message);
      console.error('Error obtaining prompt data:' + error.message);
    }
    setLoading(false);
  }

  const reloadPrompts = () => {
    setLoading(true);
    getPrompts();
  }

  return (
    <Grid>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation">
          <BreadcrumbItem>
            <a href="/">Manage intelligent decision with Hybrid AI</a>
          </BreadcrumbItem>
        </Breadcrumb>
        <h1 className="landing-page__heading">Prompts</h1>
      </Column>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Button renderIcon={Add} iconDescription="Add Prompt" onClick={() => setOpen(true)}>Add Prompt</Button>
        <Prompt mode="create" prompt={null} prompts={rows} openState={open} setOpenState={setOpen} onSuccess={reloadPrompts} setError={setError} />
      </Column>

      {loading && (
        <Column lg={3} md={2} sm={2}>
          <SkeletonText className="card" paragraph={true} lineCount={2} />
        </Column>
      )}

      {!loading && (<PromptMap rows={rows} setRows={setRows} setError={setError} reloadPrompts={reloadPrompts} />)}

      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        {error && (<ToastNotification role="alert" caption={error} timeout={3000} title="Error" subtitle="" />)}
      </Column>
    </Grid>
  );
}

export default PromptsPage;
