// src/task/3-audit.test.js
import { initializeTaskManager, taskRunner } from "@_koii/task-manager";
import { setup } from "../src/task/0-setup.js";
import { task } from "../src/task/1-task.js";
import { submission } from "../src/task/2-submission.js";
import { audit } from "../src/task/3-audit.js";
import { distribution } from "../src/task/4-distribution.js";
import { routes } from "../src/task/5-routes.js";

import { namespaceWrapper, _server } from "@_koii/namespace-wrapper";
import Joi from "joi";
import axios from "axios";

import { getAccessLink } from '../src/task/utils/getBaseInfo.js';

// Mock the getAddressArray function to return an empty array
jest.mock('./3-audit', () => ({
  ...jest.requireActual('./3-audit'),
  getAddressArray: jest.fn().mockResolvedValue([]),
}));

// Mock the getAccessLink function to prevent actual network calls
jest.mock('./utils/getBaseInfo.js', () => ({
  getAccessLink: jest.fn(),
}));

describe('audit function', () => {
  it('should return true if IPAddressArray is empty', async () => {
    const submission = {}; // Mock submission
    const roundNumber = 1;
    const submitterPublicKey = 'somePublicKey';

    const result = await audit(submission, roundNumber, submitterPublicKey);
    expect(result).toBe(false);
  });
});