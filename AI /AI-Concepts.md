# LLM

A neural network that predicts the next term of the input sequence. its like if you give input "Where there is a will" it will predict the most possible answer is "there is a way".

# Tokenization

For an input to process it in a result each of the character could be a token even a space could be a token anything that helps to predict the next word could be a token.what is the smallest term you can gain a meaning from

# Vectorization
What meaning has to be derrived from those token is the responsibility of vector. All the words that are close to each other also positioned into a vector such an way so that their closeness can represent by a value. and the words are positioned into n dimensional space.

# Attention
There could be multiple meaning of a single word depends on the context or the sentences it has been used. for example word "horse" in one sentence it can be used like: "Horse is the fastest animal" and also in physics we use something like "horse power" for two different sentence the meaning of the word could be different. so here the important is the associated word that has been used with that "keyword" to understand the "concept" like "fastest" leads to animal "power" leads to calculation

# Self Supervised Learning Model

Self Supervised Learning Model are such model which can understand the context without giving the whole input 

# Retrieval Augmented Genearation (RAG):
Suppose you have AI company. User searches through your system and get the results so the process look like this:

User -> Server(input)->LLM -> response->user.

But do you think it has biggest mistake every company has some policy documents without this user may can see any response that they should not see at least should be filtered. so to LLM you have to give the policy document as well to get the high quality result so along with the input you should provide the policy doucment but where does your document should store. it can be stored something like graphdb , vectordb. so the term looks like retrieve make it augmented and generate.


# Vector DB.

You find the relevant document for an incoming query. its like finding the closeness of the word by calculating distance.its like understanding the context within the system.

# MCP

What if the context is outside of the system. So its like a protocol to get the context and adding it to the Model. so its like a user is asking for a query and there is mcp client present in between user and model that client get the context from outside mcp server and forwards it to the llm.


