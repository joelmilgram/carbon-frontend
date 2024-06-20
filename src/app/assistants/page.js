'use client';

import AssistantTable from './AssistantTable';
import { Link, DataTableSkeleton, Pagination, Column, Grid } from '@carbon/react';

import React, { useEffect, useState } from 'react';
import { Octokit } from '@octokit/core';
import AssistantMap from './AssistantMap';

const octokitClient = new Octokit({});

const headers = [
  {
    key: 'name',
    header: 'Name',
  },
  /*
  {
    key: 'createdAt',
    header: 'Created',
  },
  {
    key: 'updatedAt',
    header: 'Updated',
  },
  */
  {
    key: 'assistantId',
    header: 'Assistant Id',
  },
  {
    key: 'description',
    header: 'Description',
  },
  {
    key: 'className',
    header: 'Class Name',
  },
  {
    key: 'agentId',
    header: 'Agent Id',
  },
];

function AssistantsPage() {
  const [firstRowIndex, setFirstRowIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [rows, setRows] = useState([]);
  const [agentSelected, setAgentSelected] = useState(null);

  useEffect(() => {
    async function getAssistants() {
      const res = await octokitClient.request(
        'GET http://localhost:8000/api/v1/a/assistants',
        {
          //per_page: 75,
          //sort: 'updated',
          //direction: 'desc',
        }
      );

      if (res.status === 200) {
        setRows(getRowItems(res.data));
      } else {
        setError('Error obtaining assistant data');
      }
      setLoading(false);
    }

    getAssistants();
  }, []);


  const displayAgent = (agentId) => {
    console.log('Agent Selected: ', agentId);
    setAgentSelected(agentId);
  }

  const getRowItems = (rows) =>
    rows.map((row, id) => ({
      ...row,
      id: id,
      name: row.name,
      description: row.description,
      assistantId: row.assistant_id,
      className: row.class_name,
      agentId: <Link onClick={displayAgent(row.agent_id)}>{row.agent_id}</Link>,
      //    createdAt: new Date(row.created_at).toLocaleDateString(),
      //    updatedAt: new Date(row.updated_at).toLocaleDateString(),
    }));

  if (loading) {
    return (
      <Grid className="repo-page">
        <Column lg={16} md={8} sm={4} className="repo-page__r1">
          <DataTableSkeleton
            columnCount={headers.length + 1}
            rowCount={10}
            headers={headers}
          />
        </Column>
      </Grid>
    );
  }

  if (error) {
    return `Error! ${error}`;
  }

  return (
    <Grid className="repo-page">
      <Column lg={16} md={8} sm={4} className="assistants-page__r1">
        <AssistantMap />
        <AssistantTable
          headers={headers}
          rows={rows.slice(firstRowIndex, firstRowIndex + currentPageSize)}
        />
        <Pagination
          totalItems={rows.length}
          backwardText="Previous page"
          forwardText="Next page"
          pageSize={currentPageSize}
          pageSizes={[5, 10, 15, 25]}
          itemsPerPageText="Items per page"
          onChange={({ page, pageSize }) => {
            if (pageSize !== currentPageSize) {
              setCurrentPageSize(pageSize);
            }
            setFirstRowIndex(pageSize * (page - 1));
          }}
        />
      </Column>
      {agentSelected && (
        <Column lg={16} md={8} sm={4} className="assistants-page__r2">
          <h4 className="redred">Agent Selected</h4>
          <p className="repo-page__r2">{agentSelected}</p>
        </Column>
      )}
    </Grid>
  );
}

export default AssistantsPage;
