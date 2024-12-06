"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Layout, Typography, Card, List, Select } from "antd";
import { Button, Input, Space } from "antd";

const { TextArea } = Input;
const { Content } = Layout;
const { Title } = Typography;

const models = [
  {
    value: "llama-3.1-sonar-small-128k-online",
    label: "llama-3.1-sonar-small-128k-online",
  },
  {
    value: "llama-3.1-sonar-large-128k-online",
    label: "llama-3.1-sonar-large-128k-online",
  },
  {
    value: "llama-3.1-sonar-huge-128k-online",
    label: "llama-3.1-sonar-huge-128k-online",
  },
];
export default function Perplexity() {
  const [perplexityResponse, setPerplexityResponse] = useState({});
  const [userPrompt, setUserPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("Be precise and concise.");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [model, setModel] = useState(models[0].value);
  const [citations, setCitations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generatePerplexity = async (values) => {
    setMessage("");
    try {
      const response = await fetch("/api/perplexity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      setPerplexityResponse(data);
    } catch (err) {
      console.info("generatePerplexity.err", err);
      setErrorMessage(
        "An error occurred while fetching the response: " + err?.message,
      );
    }

    // console.log("generatePerplexity.response", data);
  };

  useEffect(() => {
    // console.log("perplexityResponse", perplexityResponse);
    setMessage(perplexityResponse?.choices?.[0]?.message?.content);
    setCitations(perplexityResponse?.citations);
  }, [perplexityResponse]);

  const onModelChange = async (value) => {
    setModel(value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await generatePerplexity({ userPrompt, systemPrompt, model });
    } catch (error) {
      console.info("handleSubmit.Error:", error);
      // setMessage("An error occurred while fetching the response.");
      setErrorMessage(
        "An error occurred while fetching the response: " + err?.message,
      );
    }
    // await generatePerplexity({ userPrompt, systemPrompt, model });
    setIsLoading(false);
  };

  return (
    <div style={{ height: "100%", background: "white" }}>
      <Layout style={{ minHeight: "100vh" }}>
        <Content
          style={{
            padding: "24px",
            maxWidth: "1200px",
            margin: "0 auto",
            height: "100%",
          }}
        >
          <Space direction="vertical" size="large">
            <Title level={2}>Perplexity API Playground</Title>
            <div>
              <strong>Choose model:</strong>
            </div>
            <Select
              style={{ width: "800px" }}
              options={models}
              onChange={onModelChange}
              value={model}
            />
            <div>
              <strong>System prompt:</strong>
            </div>
            <TextArea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              autoSize={{ minRows: 1, maxRows: 2 }}
              style={{ width: "800px" }}
            />
            <div>
              <strong>User prompt:</strong>
            </div>
            <TextArea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              autoSize={{ minRows: 4, maxRows: 6 }}
              style={{ width: "800px" }}
            />
            <Button type="primary" onClick={handleSubmit} loading={isLoading}>
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
            {message && (
              <div>
                <strong>Request Start:</strong>{" "}
                {perplexityResponse.requestStart}
              </div>
            )}
            {message && (
              <div>
                <strong>Request End:</strong> {perplexityResponse.requestEnd}
              </div>
            )}
            {message && (
              <div>
                <strong>Usage:</strong>{" "}
                {JSON.stringify(perplexityResponse.usage)}
              </div>
            )}
            <Title level={2}>Response</Title>
            {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
            {message && <ReactMarkdown>{message}</ReactMarkdown>}
            {message && (
              <div>
                <strong>Citations:</strong>
              </div>
            )}
            {message && (
              <List
                dataSource={citations}
                renderItem={(item, index) => (
                  <List.Item>
                    <a href={item} target="_blank" rel="noopener noreferrer">
                      [{index + 1}] {item}
                    </a>
                  </List.Item>
                )}
              />
            )}
          </Space>
        </Content>
      </Layout>
    </div>
  );
}
