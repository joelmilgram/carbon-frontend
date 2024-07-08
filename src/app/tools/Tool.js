import { Dropdown, DropdownSkeleton, Modal, Select, SelectItem, TextArea, TextInput } from '@carbon/react';
import React, { useEffect, useRef, useState } from 'react';
import { Tools } from '@carbon/pictograms-react';
import { Octokit } from '@octokit/core';

const octokitClient = new Octokit({});

const Tool = ({ mode, tool, tools, openState, setOpenState, onSuccess, setError }) => {
    // mode = 'create' or 'edit'
    const [invalid, setInvalid] = useState(false);
    const [toolId, setToolId] = useState("");
    const [toolDescription, setToolDescription] = useState("");
    const [toolClassName, setToolClassName] = useState("ibu.llm.tools.client_tools");
    const [toolFctName, setToolFctName] = useState("");
    const [toolArgSchemaClass, setToolArgSchemaClass] = useState(null);

    const ref = useRef(null);
    const [start, setStart] = useState(0);
    const [end, setEnd] = useState(0);

    useEffect(() => {
        if (mode === 'edit') {
            setToolId(tool.tool_id);
            setToolDescription(tool.tool_description);
            setToolClassName(tool.tool_class_name);
            setToolFctName(tool.tool_fct_name);
            setToolArgSchemaClass(tool.tool_arg_schema_class);
        }
        setInvalid(false);
    }, [tool]);

    const upsertTool = async (mode) => {
        let ed = (mode === "create" ? "created" : "updated");
        let ing = (mode === "create" ? "creating" : "updating");

        try {
            const res = await octokitClient.request(
                (mode === "create" ? "POST" : "PUT") + " http://localhost:8000/api/v1/a/tools" + (mode === "edit" ? "/" + toolId : ""), {
                tool_id: toolId,
                tool_description: toolDescription,
                tool_class_name: toolClassName,
                tool_fct_name: toolFctName,
                tool_arg_schema_class: toolArgSchemaClass
            });

            if (res.status === 200) {
                console.log(`Tool ${ed}`, res.data);
                onSuccess();
            } else {
                setError(`Error ${ing} tool (` + res.status + ')');
                console.error(`Error ${ing} tool`, res);
            }
        }
        catch (error) {
            setError(`Error ${ing} tool: ` + error.message);
            console.error(`Error ${ing} tool`, error);
        }
    }

    const onRequestSubmit = () => {
        if (!toolId) {
            setInvalid(true);
        } else {
            const unique = tools.filter((t) => t.tool_id === toolId).length === 0;
            if (unique) {
                setInvalid(true);
            } else {
                upsertTool(mode);
                setToolId("");
                setToolDescription("");
                setToolClassName("ibu.llm.tools.client_tools");
                setToolFctName("");
                setToolArgSchemaClass(null);

                setOpenState(false);
            }
        }
    }

    const validateInput = (e) => {
        setStart(e.target.selectionStart);
        setEnd(e.target.selectionEnd);
        const value = e.target.value.replace(/ /g, '_');
        setInvalid(!value);
        const unique = tools.filter((t) => t.tool_id === toolId).length === 0;
        if (unique) {
            setInvalid(true);
        }
        setToolId(value);
    }

    return (
        <Modal open={openState}
            onRequestClose={() => setOpenState(false)}
            modalHeading={(mode == "create" ? "Create a new tool" : "Update tool " + toolId)}
            modalLabel="Tools"
            primaryButtonText={(mode == "create" ? "Add" : "Update")}
            secondaryButtonText="Cancel"
            preventCloseOnClickOutside
            shouldSubmitOnEnter
            onRequestSubmit={onRequestSubmit}>
            <p style={{ marginBottom: '1rem' }}>
                {(mode == "create" ? "Add a new tool to your Owl Agent framework." : "Update the tool information.")}
            </p>
            <Tools style={{ width: '5rem', height: 'auto', padding: "0.5rem" }} />

            <TextInput data-modal-primary-focus id="text-input-1"
                labelText="Tool Id"
                placeholder="e.g. get_contract_by_contract_number, don't use spaces."
                invalid={invalid}
                invalidText="This field cannot be empty and must be unique among the tools."
                value={toolId}
                ref={ref}
                onChange={(e) => validateInput(e)}
                onKeyUp={(e) => { ref.current.setSelectionRange(start, end); }} />
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }} />

            <TextInput id="text-input-2"
                labelText="Description"
                placeholder="e.g. this tool is to be attached to an agent based on LLM Mixtral to discover client's contracts."
                value={toolDescription}
                onChange={(e) => setToolDescription(e.target.value)} />
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }} />

            <TextInput id="text-input-3"
                labelText="Class Name"
                placeholder="class name of the tool"
                value={toolClassName}
                onChange={(e) => setToolClassName(e.target.value)} />
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }} />

            <TextInput id="text-input-4"
                labelText="Function Name"
                placeholder="function name of the tool"
                value={toolFctName}
                onChange={(e) => setToolFctName(e.target.value)} />
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }} />

            <TextInput id="text-input-5"
                labelText="Argument Schema Class"
                placeholder="argument schema class of the tool"
                value={toolArgSchemaClass}
                onChange={(e) => setToolArgSchemaClass(e.target.value)} />
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }} />

        </Modal>
    )
};

export default Tool;