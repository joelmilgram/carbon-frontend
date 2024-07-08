import React, { useEffect, useState } from 'react';
import { AspectRatio, Column, OverflowMenu, OverflowMenuItem, Popover, PopoverContent, IconButton, SkeletonText } from '@carbon/react';
import { QuestionAndAnswer } from '@carbon/pictograms-react';
import { Close } from '@carbon/react/icons';
import { Octokit } from '@octokit/core';
import Assistant from './Assistant';

const octokitClient = new Octokit({});

export const AssistantMap = ({ rows, setRows, setError, reloadAssistants }) => {
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState([]);
    const [openPopoverTable, setOpenPopoverTable] = useState([]);
    const [editAssistant, setEditAssistant] = useState(-1);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpenPopoverTable(new Array(rows.length).fill(false));

        // Preload agents
        async function getAgents() {
            try {
                const res = await octokitClient.request('GET http://localhost:8000/api/v1/a/agents');
                if (res.status === 200) {
                    setAgents(res.data);
                } else {
                    setError('Error obtaining agent data (' + res.status + ')');
                    console.error('Error obtaining agent data ', res);
                }
            } catch (error) {
                setError('Error obtaining agent data:' + error.message);
                console.error('Error obtaining agent data:' + error.message);
            }
            setLoading(false);
        }
        getAgents();
    }, [rows]);

    const displayPopoverTable = (index, open) => {
        const newOpenPopoverTable = openPopoverTable.map((item, i) => (i === index ? open : false));
        setOpenPopoverTable(newOpenPopoverTable);
    }

    if (loading) {
        return (
            <>
                {rows.map((row, i) => (<Column key={i} lg={3} md={2} sm={2} >
                    <SkeletonText className="card" />
                </Column>))}
            </>
        );
    }

    const deleteAssistant = async (index) => {
        try {
            const res = await octokitClient.request(
                `DELETE http://localhost:8000/api/v1/a/assistants/${rows[index].assistant_id}`
            );
            if (res.status === 200) {
                console.log('Assistant deleted', res.data);
                setRows((rows) => {
                    const newRows = [...rows];
                    newRows.splice(index, 1);
                    return newRows;
                });
            } else {
                setError('Error deleting assistant: ' + rows[index].assistant_id);
                console.error('Error deleting assistant', res);
            }
        } catch (error) {
            setError('Error deleting assistant: ' + error.message);
            console.error('Error deleting assistant', error);
        }
    }

    const startEdition = (index) => {
        setEditAssistant(index);
        setOpen(true);
    }

    const endEdition = () => {
        setEditAssistant(-1);
        reloadAssistants();
    }

    return (
        <>
            {(editAssistant !== -1) && (
                <Assistant mode="edit" assistant={rows[editAssistant]} openState={open} setOpenState={setOpen} onSuccess={endEdition} setError={setError} />
            )}
            {rows.map((row, i) => (<Column key={i} lg={3} md={2} sm={2} >
                <AspectRatio className="card" ratio="4x3">
                    <div className="card-header" >
                        <QuestionAndAnswer style={{ padding: "0.5rem" }} />
                        <OverflowMenu className="card-menu" >
                            <OverflowMenuItem itemText="Edit" onClick={() => startEdition(i)} />
                            <OverflowMenuItem hasDivider isDelete itemText="Delete" onClick={() => deleteAssistant(i)} />
                        </OverflowMenu>
                    </div>
                    <div className="card-name">{row.name}</div>
                    <div className="card-item-id">{row.assistant_id}</div>
                    <div className="card-description">{row.description}</div>
                    <div className="card-class-name" title="Assistant's class name">{row.class_name}</div>
                    {agents.filter(agent => agent.agent_id === row.agent_id).map((agent, j) => (
                        <div key={j} className="card-item-id">
                            Agent: <Popover title="Display agent details" align="bottom-left" open={openPopoverTable[i]} >
                                <a onClick={() => displayPopoverTable(i, true)}>{row.agent_id}</a>
                                <PopoverContent className="card-popover-content">
                                    <IconButton label="Close" renderIcon={Close} align="top-right" kind="ghost" onClick={() => displayPopoverTable(i, false)} />
                                    <div className="card-name">{row.agent_id}</div>
                                    <div className="card-name">{agent.name}</div>
                                    <div className="card-class-name">Class name: {agent?.class_name}</div>
                                    <div className="card-description">{agent?.description}</div>
                                    <div className="card-detail">LLM: {agent?.modelName}</div>
                                    <div className="card-detail">Prompt ref: {agent?.prompt_ref}</div>
                                    <div className="card-detail">Temperature: {agent?.temperature}</div>
                                    <div className="card-detail">Top K: {agent?.top_k}</div>
                                    <div className="card-detail">Top P: {agent?.top_p}</div>
                                    {(agent.tools && agent.tools.length > 0) && (
                                        <div className="card-description">Tools:
                                            <ul>
                                                {agent.tools.map((tool, j) => (
                                                    <li key={j}>{tool}</li>
                                                ))}
                                            </ul>
                                        </div>)}
                                </PopoverContent>
                            </Popover>
                        </div>))}
                </AspectRatio>
            </Column>
            ))
            }
        </>
    );
};

export default AssistantMap;
