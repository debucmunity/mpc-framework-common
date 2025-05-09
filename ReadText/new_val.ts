'use strict';

import { Circuit,CircuitIOInfo,MpcParticipantSettings } from "../src/types";
import * as fs from 'fs';
import * as path from 'path';
// process.stdin.resume();
// process.stdin.setEncoding('utf-8');
import {open,} from 'node:fs/promises';

function dupicate_character(str: string, num: number): string {
  let result = '';
  for (let i = 0; i < num; i++) {
    result += ` ${str}`;
  }
  return result;
}

async function readFileFromCircuit(filePath: string): Promise<string[]> {
  const file = await open(filePath, 'r');
  let lines: string[] =[];
  for await (const line of file.readLines()) {
    lines.push(line);
  }
  return lines;
}


function to_Bristol_format(lines: string[]): string[] {
  let ans: string[] = [];
  let chars: string[][] = [];
  for (let i of lines)
    chars.push(i.split(" "));
  // console.log(chars);
  for (let i=4;i<lines.length;i++)
  {
    let sum_wire: number =Number(chars[i][0]) + Number(chars[i][1])
    let first_line = `1 ${sum_wire} \n`;
    let dup_input=dupicate_character(`1`, Number(chars[i][0]));
    let dup_output=dupicate_character(`1`, Number(chars[i][1]));
    let tmp: string = `${first_line} ${Number(chars[i][0])}${dup_input} \n` + ` ${Number(chars[i][1])}${dup_output} \n \n `;
    
    ans.push(tmp + lines[i])
  }
  return ans;
}


async function readFileFromCircuitInfo(filePath: string): Promise<string> {
  const file = await open(filePath, 'r');
  let lines: string[] =[];
  for await (const line of file.readLines()) {
    lines.push(line);
  }
  return lines[0];
}

// function getMPCsettings(circuit: string): 


export async function create_(circuitfile: string, circuitInfofile: string): Promise<Circuit> {
  const circuitPath = circuitfile; // Thay bằng đường dẫn thực tế
  const circuitInfoPath = circuitInfofile; // Thay bằng đường dẫn thực tế
  const Arith_bristol = await readFileFromCircuit(circuitPath);
  const circuitInfo = JSON.parse(await readFileFromCircuitInfo(circuitInfoPath));
  // console.log(circuitInfo);
  let inputs: CircuitIOInfo[] = [];
  
  for (let i of circuitInfo.inputs) {
    inputs.push({
      name: i.name,
      type: i.type,
      address: i.address,
      width: i.width,
    });
  }

  let outputs: CircuitIOInfo[] = [];
  for (let i of circuitInfo.outputs) {
    outputs.push({
      name: i.name,
      type: i.type,
      address: i.address,
      width: i.width,
    });
  }
  let input_for_A: string[] = [];
  let input_for_B: string[] = [];
  for (let i = 0; i< inputs.length; i++) {
    if (i < Math.floor(inputs.length / 2)) {
      input_for_A.push(inputs[i].name);
    } else {
      input_for_B.push(inputs[i].name);
    }
  }

  let output_name: string[] = [];
  for (let i = 0; i< outputs.length; i++) {
    output_name.push(outputs[i].name);
  }

  let testcase: Circuit = { 
    bristol: Arith_bristol.join('\n'),
    info: {
      constants: [],
      inputs: inputs,
      outputs: outputs,
    },
    mpcSettings: [
    {
      name: 'alice',
      inputs: input_for_A,
      outputs: output_name,
    },
    {
      name: 'bob',
      inputs: input_for_B,
      outputs: output_name,
    },
  ],
  }
  // console.log(input_for_A);
  // console.log(input_for_B);
  // console.log(output_name);
  // console.log(testcase.bristol);
  // console.log(testcase.info);
  // console.log(testcase.mpcSettings);
  return testcase;
}

