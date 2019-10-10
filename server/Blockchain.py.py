#written from the medium implementation of snakecoin, to help me learn about blockchain
import hashlib as hashslingingslasher
import datetime as date
import json
import requests
from flask import Flask
from flask import request
import time
from flask_cors import CORS, cross_origin

peer_nodes = ['http://10.74.50.150:5000']

##DEFINE A BLOCK
class Block: #this is defining each block, sorta like a linked list, but a lot more hashing
	def __init__ (self, index, timestamp, data, previous_hash): #defining a constructor
		self.index = index
		self.timestamp = timestamp
		self.data = data
		self.previous_hash = previous_hash
		self.hash = self.getHash() #setting all of its properties!

	def getHash(self): #hashes a block
		sha = hashslingingslasher.sha256()
		#feed it!
		string = str(self.index) + str(self.timestamp) + str(self.data) + str(self.previous_hash)
		string = string.encode("utf-8")
		sha.update(string) #including the previous hash is good, because if the block before is changed, its hash changes, which changes this hash, which changes everything after and suddenly nothin really matches up because every hash is all out of wack; this is good for integrity!
		return sha.hexdigest()
        def __str__(self):
                return "{Index: " + str(self.index) + ", timestamp: " + str(self.timestamp) + ", data: " + str(self.data) + ", previous hash: " + str(self.previous_hash) + ", hash: " + str(self.hash) + "} \n"


###CREATE THE BLOCKCHAIN

#start with the genesis block; the first in the chain with arbitrary data and hashes surrounding it, to get the chain started. The rest chains to this.
def genesis():
	dictionary_json = {
		"proof-of-work": 69,
		"transactions": [{"to": "2cd03c3e54230e2d57a76f28e2cc5308", "from": "69man", "amount": 3}, {"to": "25man", "from": "2cd03c3e54230e2d57a76f28e2cc5308", "amount": 2}]#TESTING #["None."]
	}
	return Block(0, date.datetime.now(), dictionary_json, "0")

#generate subsequent blocks
def next_block(last_block):
	this_index = last_block.index + 1
	this_timestamp = date.datetime.now()
	this_data = "yo " + str(this_index) #this, I think depends, on all the data that has been put up; so like say there are 10 transactions, 3 might be mined into a block and then chained on; and that gets into proof of work and such I think, so for now we are autogenerating data but i think this part needs to be changed.
	this_prev = last_block.hash
	return Block(this_index, this_timestamp, this_data, this_prev)

#this is a draft, I believe this should change, but for now store the blockchain as a list :/
#draft_chain = [genesis()]

#for i in range(1, 20): #20 blocks!
#	draft_chain.append(next_block(draft_chain[i-1]))
#	print "Adding block " + str(i) + " to the chain!"
#	print draft_chain[i].hash
#	print ""


blockchain = [genesis()]

#define a flask server. each node runs this.
node = Flask(__name__)

this_nodes_transactions = []

@node.route('/txion', methods=['POST'])
def transaction(): #maybe parse the request to verify it's legit?????????
	if request.method == 'POST':
		##basically, take the posted json of a transaction and add it to the list.
		new_txion = request.get_json()
                #new_txion has the u'string' issue:
		a = new_txion #these are variable names i used when testing this conversion, they're short n easy.
		b = []
		for i in new_txion:
                        if(i == 'amount'):
                                b.append({str(i):float(a[i])})
                        else:
                                b.append({str(i):str(a[i])})
                b[0].update(b[1])
                b[0].update(b[2])

                new_txion = b[0]

		
		this_nodes_transactions.append(new_txion)
		if (len(this_nodes_transactions) < 4):#test this w multiple servers? Set up a system where all transactions are relayed to everyone or check if a new block is added, prune all transactions from this one that are in the new one then add
			return json.dumps({"response": ".ok!", "transactions": str(this_nodes_transactions)}) + '\n'#"Transaction submission successful." #remember to return something! Otherwise you get a code 500 and an error about an invalid return type
		else:
			return mine()
		#return mine() #this means each block is 1 transaction, otherwise it'll wait for 4 and then you might overspend, and your transactions to users of this node's service won't be logged until there's 4 in the system...
                #NEED A SMARTER SOLUTION FOR THIS!!!!!!!!!!!!!!!


#node.run()

@node.route('/add', methods = ['POST']) #adds a normal block, if mined by another node
def add_block():
	if request.method == 'POST':
		new_block = request.get_json() #i'm not sure if the json will manifest itself weird and have the block packed into a data header or something...
		print new_block
		hashy = new_block["last_hash"]
		data = new_block["data"]
		index = new_block["index"]
		timestamp = new_block["timestamp"]
		blockchain.append(Block(index, timestamp,data, hashy))

miner_address = "sdwer3eq3623gx" #eventually, this will operate on a separate machine, and send its POW to localhost:5000/mine and that will verify it, then add it to the blockchain. For now, miners and nodes are one and the same. That might be the point though! So nvm. If miners are nodes as well, that incentivizes being a node.
#(address of this node, if nodes and miners are the same)


def proof_of_work(last_proof):
	#testing divisibility by 9 AND the last proof. if a number that we have gotten from this proof of work is divisible by 9, we are good. you'll see:
	incrementor = last_proof + 1
	while (not incrementor%9 ==0 and incrementor%last_proof == 0):
		incrementor += 1
	return incrementor

#merge this method with transactions, so it runs auto!!!

#@node.route('/mine', methods=['GET']): #(('/mine'), methods = ['GET']) #make this run automatically once transactions hits like a length of 4
def mine():
	#get last POW
	last_block = blockchain[len(blockchain) - 1]
	last_proof = last_block.data['proof-of-work']
	#calculate the current proof of work
	pow = proof_of_work(last_proof)
	#okay so once we find it, let's give the miner a point
	this_nodes_transactions.append( {"from": "network", "to": miner_address, "amount": 1} )

	#make a new block
	new_block_data = {
		"proof-of-work": pow,
		"transactions": list(this_nodes_transactions)
	}

	new_block_index = last_block.index + 1
	new_block_timestamp = this_timestamp = date.datetime.now()
	last_block_hash = last_block.hash

	#empty old transactions
	this_nodes_transactions[:] = []

	mined_block = Block(new_block_index, new_block_timestamp, new_block_data, last_block_hash)

        global blockchain
	blockchain.append(mined_block)

        #print '\n'
        #for i in blockchain:
        #        print str(i)       
        
	#send block to others
	#do this by formatting the block as a dictionary, then as a json.
	#then send
	propagate(mined_block)

	#wait like 1 second
	time.sleep(1)

	#run consensus
	consensus()


	return json.dumps({
		"index": new_block_index,
		"timestamp":str(new_block_timestamp),
		"data": new_block_data,
                "hash": mined_block.hash
		"last_hash": last_block_hash
	}) + '\n'

@node.route('/blocks', methods=['GET'])
def get_blocks(): #using this so that every node can get each other's blocks
	chain_to_send = []
	for block in blockchain:
                #print('here')
                #print str(block)
		block_index = block.index
		block_timestamp = str(block.timestamp)
		block_data = block.data
		block_hash = block.hash
		block = {
			"index": block_index,
			"timestamp": block_timestamp,
			"data": block_data,
			"hash": block_hash,
                        "last_hash": block.last_hash
		} #formatting as a dictionary to easily convert to a json, this also implies that for eaches create aliases in pythons
                chain_to_send.append(block)
        #print chain_to_send
	chain_to_send = json.dumps(chain_to_send)
	return chain_to_send

#peer_nodes = []

def find_new_chains():
	other_chains = []
	for node_url in peer_nodes:
		block = requests.get(node_url + "/blocks").content
		block = json.loads(block)
		other_chains.append(block)
	return other_chains

def consensus(): #consensus is found by whoever has the longest chain
        #print blockchain
	other_chains = find_new_chains()

	global blockchain #without this, says its referenced before its assigned a value.
	longest_chain = blockchain
	for chain in other_chains:
		if (len(longest_chain) < len(chain)):
			longest_chain = chain
	blockchain = longest_chain

#idk when this method is executed ^^
#@node. (nvm, i include it in the mine method)

def propagate(block):
	index = str(block.index)
	timestamp = str(block.timestamp) #maybe make this "converting to dictionary" a method??
	data = str(block.data)
	hashy = str(block.hash)
	json_block = {
		"index": index,
		"data": data,
		"timestamp": timestamp,
		"hash": hashy,
                "last_hash": str(block.last_hash)
	}
	#print blockchain
	for node_url in peer_nodes:
		requests.post(node_url + '/add', json=json.dumps(json_block))
CORS(node)
node.run(host='0.0.0.0', threaded = True) #crucial, in case im like waiting 10 seconds and i get another block, or something like that, allows concurrent requests!!!

