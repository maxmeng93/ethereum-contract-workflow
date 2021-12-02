import address from "../address.json";
import ProjectList from "../compiled/ProjectList.json";
import web3 from "./web3";

const contract = new web3.eth.Contract(ProjectList.abi, address);

export default contract;