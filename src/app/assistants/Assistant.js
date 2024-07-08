import { Dropdown, DropdownSkeleton, Modal, Select, SelectItem, TextArea, TextInput } from '@carbon/react';
import React, { useEffect, useState } from 'react';
import { QuestionAndAnswer } from '@carbon/pictograms-react';
import { Octokit } from '@octokit/core';

const octokitClient = new Octokit({});

const Assistant = ({ mode, assistant, openState, setOpenState, onSuccess, setError }) => {
    // mode = 'create' or 'edit'
    const [loading, setLoading] = useState(true);
    const [empty, setEmpty] = useState(false);
    const [assistantId, setAssistantId] = useState("");
    const [assistantName, setAssistantName] = useState("");
    const [assistantDescription, setAssistantDescription] = useState("");
    const [className, setClassName] = useState("athena.llm.assistants.BaseAssistant.BaseAssistant");
    const [dropdownItems, setDropdownItems] = useState([]);
    const [currentItem, setCurrentItem] = useState(""); // selected agent

    useEffect(() => {
        if (mode === 'edit') {
            setAssistantId(assistant.assistant_id);
            setAssistantName(assistant.name);
            setAssistantDescription(assistant.description);
            setClassName(assistant.class_name);
            setCurrentItem({ "selectedItem": assistant.agent_id });
        } else {
            setCurrentItem("");
        }
        setEmpty(false);
    }, [assistant]);

    useEffect(() => {
        // Preload agents
        async function getAgents() {
            try {
                const res = await octokitClient.request('GET http://localhost:8000/api/v1/a/agents');
                if (res.status === 200) {
                    const items = res.data.map(agent => (agent.agent_id));
                    setDropdownItems(items);
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
    }, []);

    const upsertAssistant = async (mode) => {
        let ed = (mode === "create" ? "created" : "updated");
        let ing = (mode === "create" ? "creating" : "updating");

        try {
            const res = await octokitClient.request(
                (mode === "create" ? "POST" : "PUT") + " http://localhost:8000/api/v1/a/assistants" + (mode === "edit" ? "/" + assistantId : ""), {
                assistant_id: (mode === "create" ? assistantName.replace(/ /g, '-').toLowerCase() : assistantId),
                name: assistantName,
                description: assistantDescription,
                class_name: className,
                agent_id: currentItem.selectedItem || (mode === "create" ? "" : assistant.agent_id)
            });

            if (res.status === 200) {
                console.log(`Assistant ${ed}`, res.data);
                onSuccess();
            } else {
                setError(`Error ${ing} assistant (` + res.status + ')');
                console.error(`Error ${ing} assistant`, res);
            }
        }
        catch (error) {
            setError(`Error ${ing} assistant: ` + error.message);
            console.error(`Error ${ing} assistant`, error);
        }
    }

    const onRequestSubmit = () => {
        if (!assistantName) {
            setEmpty(true);
        } else {
            upsertAssistant(mode);
            setAssistantId("");
            setAssistantName("");
            setAssistantDescription("");
            setClassName("athena.llm.assistants.BaseAssistant.BaseAssistant");
            setCurrentItem("");

            setOpenState(false);
        }
    }

    return (
        <Modal open={openState}
            onRequestClose={() => setOpenState(false)}
            modalHeading={(mode == "create" ? "Create a new assistant" : "Update assistant " + assistantId)}
            modalLabel="Assistants"
            primaryButtonText={(mode == "create" ? "Add" : "Update")}
            secondaryButtonText="Cancel"
            preventCloseOnClickOutside
            shouldSubmitOnEnter
            onRequestSubmit={onRequestSubmit}>
            <p style={{ marginBottom: '1rem' }}>
                {(mode == "create" ? "Add a new assistant to your Owl Agent framework." : "Update the assistant information.")}
            </p>
            <QuestionAndAnswer style={{ width: '5rem', height: 'auto', padding: "0.5rem" }} />

            <TextInput data-modal-primary-focus id="text-input-1"
                labelText="Assistant name"
                placeholder="e.g. IBU new assistant"
                invalid={empty}
                invalidText="This field cannot be empty"
                value={assistantName}
                onChange={(e) => { setEmpty(!e.target.value); setAssistantName(e.target.value) }} />
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }} />

            <TextArea id="text-area-1"
                labelText="Description"
                value={assistantDescription}
                onChange={(e) => setAssistantDescription(e.target.value)}
                placeholder="e.g. This is the new IBU assistant that uses LLM and Business Rules to make intelligent decisions..." />
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }} />

            <Select id="select-class-name"
                defaultValue={className}
                labelText="Class Name"
                onChange={(e) => setClassName(e.target.value)}>
                <SelectItem value="" text="" />
                <SelectItem
                    value="athena.llm.assistants.BaseAssistant.BaseAssistant"
                    text="athena.llm.assistants.BaseAssistant.BaseAssistant" />
            </Select>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }} />

            {loading && (<DropdownSkeleton />)}
            {!loading && (<Dropdown
                key={Math.random().toString()}
                id="drop-down-agent"
                label="Agent"
                titleText="Agent"
                items={dropdownItems}
                onChange={(selectedItem) => setCurrentItem(selectedItem)}
                initialSelectedItem={currentItem && currentItem.selectedItem} />)}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }} />
        </Modal>
    )
};

export default Assistant;