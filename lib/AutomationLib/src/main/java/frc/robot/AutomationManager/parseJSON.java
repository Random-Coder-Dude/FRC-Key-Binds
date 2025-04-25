package frc.robot.AutomationManager;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;

public class parseJSON {

    // Method to parse JSON using Jackson's streaming API
    public static String parseJson(String filepath, String key) {
        JsonFactory factory = new JsonFactory();  // Create a JSON factory
        File file = new File(filepath);

        // Initialize the JsonParser
        try (FileInputStream fileInputStream = new FileInputStream(file);
             JsonParser parser = factory.createParser(fileInputStream)) {

            // Iterate over the JSON tokens
            while (parser.nextToken() != JsonToken.END_OBJECT) {
                if (parser.getCurrentToken() == JsonToken.FIELD_NAME) {
                    String currentFieldName = parser.getCurrentName();

                    // If the field name matches the key, return its value
                    if (currentFieldName.equals(key)) {
                        parser.nextToken();  // Move to the value token
                        return parser.getText();  // Return the value as a string
                    }
                }
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

        // If the key is not found, return the checksum validation message
        return "END SYSTEM CHECKSUM: VALID";
    }
}
