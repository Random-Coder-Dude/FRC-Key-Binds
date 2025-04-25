package frc.robot.AutomationManager;

import java.io.File;

public class Automation {
    private String m_name;
    private File m_file;

    public Automation(String name, String filepath) {
        m_name = name;
        m_file = new File(filepath);
    }

    public String getName() {
        return m_name;
    }

    public File getFile() {
        return m_file;
    }

    public boolean isValid() {
        return m_file.exists() && m_file.isFile();
    }

    public String getStep(int stepNumber) {
        if (isValid()) {
            String value = parseJSON.parseJson(m_file.getPath(), "Action" + Integer.toString(stepNumber));
            return value;
        }
        else {
            return null;
        }
    }
}
