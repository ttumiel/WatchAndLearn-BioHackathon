import { Box, Flex, Heading, Text, HStack } from "@chakra-ui/react";
import DayNight from "./DayNight";
import Image from 'next/image';

const Layout = ({ children }) => {
  return (
    <Box position="relative" minH="100vh">
      <Flex align="flex-start" justify={"space-between"} px={12} pt={8}>
        <HStack>
          <Image
            src="/logo.png"
            alt="logo"
            width={76}
            height={76}
            layout="fixed"
          />
          <Box>
            <Heading as="h1" size="lg">
              Watch and Learn
            </Heading>
            <Text fontSize="sm" fontStyle="oblique">
              Converting Lab Demos to Shareable Protocols.
            </Text>
          </Box>
        </HStack>
        <DayNight />
      </Flex>
      <Box>{children}</Box>
    </Box>
  );
};

export default Layout;
