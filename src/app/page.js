"use client";

import React, { useState, useEffect } from "react";
import { Box, Flex, SkeletonText, useColorModeValue, Text, Heading } from "@chakra-ui/react";
import Layout from "../components/Layout";
import VideoUpload from "@/components/VideoUpload";

import axios from 'axios';

const Page = () => {
  const [transcription, setTranscription] = useState("");
  const [labProtocol, setLabProtocol] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(null);
  const bg = useColorModeValue("gray.100", "gray.700");

  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        const transcriptionResponse = await axios.post('https://us-west1-biohack-404817.cloudfunctions.net/biohack-transcription', {path: videoUrl});
        setTranscription(transcriptionResponse.data);
        return transcriptionResponse.data;
      } catch (error) {
        console.error('Error fetching transcription:', error);
      }
    };

    const fetchLabProtocol = async (tx) => {
      try {
        const labProtocolResponse = await axios.post('https://us-west1-biohack-404817.cloudfunctions.net/biohack-protocol?', {path: videoUrl, transcription: tx });
        setLabProtocol(labProtocolResponse.data);
      } catch (error) {
        console.error('Error fetching lab protocol:', error);
      }
    };

    if (videoUrl) {
      setIsLoading(true);
      fetchTranscription()
        .then(tx => fetchLabProtocol(tx))
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
                  isLoaded={!isLoading}
                >
                  <Text>{labProtocol}</Text>
                </SkeletonText>
              </Box>
            )}
          </Flex>
        </Box>
      </Flex>
    </Layout>
  );
};

export default Page;
