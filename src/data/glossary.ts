export interface GlossaryTerm {
  term: string;
  definition: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  { term: "Artificial Intelligence (AI)", definition: "Technology that enables computers to simulate human intelligence, including learning, reasoning, and problem-solving." },
  { term: "Machine Learning (ML)", definition: "A subset of AI where computers learn patterns from data without being explicitly programmed for every scenario." },
  { term: "Deep Learning", definition: "A type of machine learning that uses neural networks with many layers to analyze complex patterns in large datasets." },
  { term: "Neural Network", definition: "A computing system inspired by the human brain, made up of interconnected nodes that process information in layers." },
  { term: "Natural Language Processing (NLP)", definition: "AI technology that helps computers understand, interpret, and generate human language." },
  { term: "Large Language Model (LLM)", definition: "An AI model trained on massive amounts of text data that can generate, summarize, and understand language. Examples: GPT-4, Claude, Llama." },
  { term: "Generative AI", definition: "AI that can create new content like text, images, music, or video based on patterns learned from training data." },
  { term: "Prompt", definition: "The text instruction or question you give to an AI model to get a response. Better prompts lead to better outputs." },
  { term: "Prompt Engineering", definition: "The practice of crafting effective prompts to get the best possible responses from AI models." },
  { term: "Fine-tuning", definition: "The process of taking a pre-trained AI model and training it further on specific data to improve its performance for a particular task." },
  { term: "Hallucination", definition: "When an AI model generates information that sounds plausible but is factually incorrect or made up." },
  { term: "Token", definition: "The basic unit of text that AI models process. A token can be a word, part of a word, or a punctuation mark." },
  { term: "API (Application Programming Interface)", definition: "A way for different software applications to communicate with each other. AI APIs let you integrate AI capabilities into your own apps." },
  { term: "Computer Vision", definition: "AI technology that enables computers to interpret and understand visual information from images and videos." },
  { term: "Transformer", definition: "A type of neural network architecture that revolutionized NLP. It's the 'T' in GPT and powers most modern language models." },
  { term: "Training Data", definition: "The dataset used to teach an AI model. The quality and diversity of training data directly affects how well the model performs." },
  { term: "Inference", definition: "The process of using a trained AI model to make predictions or generate outputs on new data." },
  { term: "AGI (Artificial General Intelligence)", definition: "A theoretical AI system that can understand, learn, and apply intelligence across any task — matching or exceeding human ability." },
  { term: "RAG (Retrieval-Augmented Generation)", definition: "A technique that combines AI text generation with real-time information retrieval to provide more accurate and up-to-date responses." },
  { term: "Diffusion Model", definition: "A type of generative AI that creates images by gradually removing noise from random data. Used by DALL-E, Stable Diffusion, and Midjourney." },
];
