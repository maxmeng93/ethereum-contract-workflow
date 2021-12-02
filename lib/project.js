import Project from "../compiled/Project.json";
import web3 from "./web3";

const getContract = (address) => new web3.eth.Contract(Project.abi, address);

export default getContract;
