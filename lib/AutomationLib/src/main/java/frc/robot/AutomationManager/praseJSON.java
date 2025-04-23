package frc.robot.AutomationManager;

import java.nio.file.Files;
import java.nio.file.Paths;
import org.json.JSONObject;

public class praseJSON {
    
    public String parseJson(String filepath, String key) {
        try {
            // Read the JSON file content
            String content = new String(Files.readAllBytes(Paths.get(filepath)));

            // Parse the JSON content
            JSONObject jsonObject = new JSONObject(content);

            // Retrieve the value associated with the specified key
            String value = jsonObject.getString(key);

            return value;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

}
