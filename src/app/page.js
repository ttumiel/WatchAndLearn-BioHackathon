"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  SkeletonText,
  useColorModeValue,
  Text,
  Heading,
  Skeleton,
} from "@chakra-ui/react";
import Layout from "../components/Layout";
import VideoUpload from "@/components/VideoUpload";
import ThreeScene from "@/components/ThreeScene"; // Adjust the path as necessary
import MermaidChart from "@/components/MermaidChart"; // Adjust the path as necessary
import Sim2D from "@/components/Sim2D";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  materialLight,
  materialDark,
} from "react-syntax-highlighter/dist/cjs/styles/prism";

import axios from "axios";

const MarkdownContent = ({ md, style }) => {
  return (
    <Markdown
      children={md}
      components={{
        code(props) {
          const { children, className, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <SyntaxHighlighter
              {...rest}
              PreTag="div"
              children={String(children).replace(/\n$/, "")}
              language={match[1]}
              style={style}
            />
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          );
        },
      }}
    />
  );
};

const Page = () => {
  const [transcription, setTranscription] = useState("");
  const [labProtocol, setLabProtocol] = useState("");
  const [openTrons, setOpenTrons] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const bg = useColorModeValue("gray.100", "gray.700");
  const codeColor = useColorModeValue(materialLight, materialDark);

  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        const transcriptionResponse = await axios.post(
          "https://us-west1-biohack-404817.cloudfunctions.net/biohack-transcription",
          { path: videoUrl }
        );
        setTranscription(transcriptionResponse.data);
        return transcriptionResponse.data;
      } catch (error) {
        console.error("Error fetching transcription:", error);
      }
    };

    const fetchLabProtocol = async (tx) => {
      try {
        const labProtocolResponse = await axios.post(
          "https://us-west1-biohack-404817.cloudfunctions.net/biohack-protocol",
          { path: videoUrl, transcription: tx }
        );
        setLabProtocol(labProtocolResponse.data);
        return labProtocolResponse.data;
      } catch (error) {
        console.error("Error fetching lab protocol:", error);
      }
    };

    const fetchOpenTrons = async (protocol) => {
      try {
        const opentronResp = await axios.post(
          "https://us-west1-biohack-404817.cloudfunctions.net/biohack-conversion",
          { protocol: protocol }
        );
        console.log(opentronResp.data);
        setOpenTrons(opentronResp.data);
      } catch (error) {
        console.error("Error fetching opentrons:", error);
      }
    };

    if (videoUrl) {
      setIsLoading(true);
      fetchTranscription()
        .then((tx) => fetchLabProtocol(tx))
        .then((tx) => fetchOpenTrons(tx))
        .finally(() => setIsLoading(false));
    }
  }, [videoUrl]);


  return (
    <Layout>
      <Flex justifyContent="center" mt={16}>
        <Box maxW="4xl" w="full" pb={32}>
          <VideoUpload onUploadComplete={setVideoUrl} />
          <Flex direction="column" gap={4} mt={8}>
            {videoUrl && (
              <Box bg={bg} shadow="md" p={4} borderRadius="md">
                <Heading size="md">Transcription</Heading>
                <SkeletonText
                  mt="4"
                  noOfLines={4}
                  spacing="4"
                  isLoaded={transcription != ""}
                >
                  <Text>{transcription}</Text>
                </SkeletonText>
              </Box>
            )}
            {videoUrl && (
              <Box bg={bg} shadow="md" p={4} borderRadius="md">
                <Heading size="md">Lab Protocol</Heading>
                <SkeletonText
                  mt="4"
                  noOfLines={6}
                  spacing="4"
                  isLoaded={labProtocol != ""}
                >
                  <Box px={4}>
                    <Markdown children={labProtocol} />
                  </Box>
                </SkeletonText>
              </Box>
            )}
            {videoUrl && (
              <>
                <Box bg={bg} shadow="md" p={4} borderRadius="md">
                  <Heading size="md">Opentrons Code</Heading>
                  <SkeletonText
                    mt="4"
                    noOfLines={12}
                    spacing="4"
                    isLoaded={openTrons != ""}
                  >
                    <Box px={4} overflow="scroll">
                      <MarkdownContent style={codeColor} md={openTrons} />
                    </Box>
                  </SkeletonText>
                </Box>

                <Box bg={bg} shadow="md" p={4} borderRadius="md">
                  <Heading size="md">Simulator</Heading>
                  {openTrons == "" ? (
                    <Skeleton height="500px" />
                  ) : (
                    <ThreeScene />
                  )}
                </Box>
                <Box bg={bg} shadow="md" p={4} borderRadius="md">
                  <Heading size="md">Well Simulator</Heading>
                  {openTrons == "" ? (
                    <Skeleton height="500px" />
                  ) : (
                    <Sim2D />
                  )}
                </Box>
                <Box bg={bg} shadow="md" p={4} borderRadius="md">
                  <Heading size="md">Workflow</Heading>
                  {openTrons == "" ? (
                    <Skeleton height="500px" />
                  ) : (
                    <MermaidChart />
                  )}
                </Box>
              </>
            )}
          </Flex>
        </Box>
      </Flex>
    </Layout>
  );
};

export default Page;
