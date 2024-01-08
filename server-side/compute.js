const PDFParser = require('pdf-parse');
const wordCount = require('word-count');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const tfidf = new natural.TfIdf();


const fs = require('fs');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name } = require('./aws.js'); // Adjust path as necessary
const dbConnection = require('./database.js'); // Adjust path as necessary

// Utility function for database queries
const queryAsync = (sql, params) => new Promise((resolve, reject) => {
    dbConnection.query(sql, params, (err, results) => {
        if (err) {
            reject(err);
        } else {
            resolve(results);
        }
    });
});

// Function for downloading a file and saving it locally

exports.compute_file = async (req, res) => {
    try {
        const jobId = req.params.jobid;

        // Query the database to get the file info
        const jobResult = await queryAsync('SELECT originaldatafile, datafilekey FROM jobs WHERE jobid = ?', [jobId]);
        if (jobResult.length === 0) {
            return res.status(404).send('Job not found');
        }
        const { originaldatafile, datafilekey } = jobResult[0];

        // Get the file from S3
        const getObjectParams = {
            Bucket: s3_bucket_name,
            Key: datafilekey
        };
        const data = await s3.send(new GetObjectCommand(getObjectParams));
        const pdfBuffer = await streamToBuffer(data.Body);

        // Use pdf-parse to extract text from the PDF buffer
        const raw = await pdfParse(pdfBuffer);

        // Display or use the extracted text
        const textfile = raw.text;


        //const pdfFilename  = jobId;
        //const dataBuffer = fs.readFileSync(pdfFilename);
        //const pdfData = await PDFParser(dataBuffer);
        // to text
        //const pdfText = pdfData.text;

        // counts
        const wordsCount = wordCount(textfile);
        const pagesCount = textfile.numpages;
        // nlp
        // Tokenize the text
        const tokens = tokenizer.tokenize(textfile);

        let dicts = {}; // Initialize an empty object

        for (const word of tokens) {
            // Check if the word is numeric
            const isNumeric = !isNaN(parseFloat(word)) && isFinite(word);

            // Do something based on whether the word is numeric or not
            if (isNumeric) {
                // Your logic for numeric words
                continue; // Skip to the next iteration of the loop
            } else {
                const start = word[0].toLowerCase();
                
                if (start in dicts) {
                    dicts[start] += 1;
                } else {
                    dicts[start] = 1;
                }

                // Your logic for non-numeric words
                console.log(`${word} is not numeric.`);
            }
        }

        // Print the dictionary after the loop
        console.log(dicts);

        // Add the document to the TF-IDF
        tfidf.addDocument(tokens);

        // Get the list of keywords and their weights
        const keywords = tfidf.listTerms(0 /* document index */);

        // Extract keywords
        const extractedKeywords = keywords.map(keyword => keyword.term);

        console.log(extractedKeywords.length, wordsCount);

        return res.status(200).send({
            //content: pdfText,
            words: wordsCount,
            pages: pagesCount,
            startwords: dicts,
            tags: extractedKeywords
            
        });
    } catch (err) {
        console.error('Error computing file:', err);
        res.status(500).send('Error computing file');
    }
};


function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', (error) => reject(error));
    });
}
  
// Helper function to parse PDF content
async function pdfParse(pdfBuffer) {
    const pdfData = await PDFParser(pdfBuffer);
    return pdfData;
  }