package frc.robot.AutomationManager;

import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.List;
import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.SequentialCommandGroup;

public class GenerateCommands extends SequentialCommandGroup {
    private final Automation m_automation;
    List<Command> commands = new ArrayList<>();

    public GenerateCommands(Automation automation) {
        this.m_automation = automation;

        List<Command> commands = new ArrayList<>();

        int stepNumber = 0;
        while (true) {
            String step = m_automation.getStep(stepNumber);

            if (step == null || step.equals("END SYSTEM CHECKSUM: VALID")) {
                break;
            }

            Command command = createCommandFromName(step.trim());
            if (command != null) {
                commands.add(command);
            } else {
                System.out.println("Unknown command: " + step);
            }

            stepNumber++;
        }

        addCommands(commands.toArray(new Command[0]));
    }

    private Command createCommandFromName(String commandName) {
        try {
            // Try to get the Class object for the command name
            Class<?> commandClass = Class.forName("frc.robot.Commands." + commandName);

            // Check if the command has a no-arg constructor (most commands do)
            Constructor<?> constructor = commandClass.getConstructor();

            // Instantiate the command dynamically using reflection
            return (Command) constructor.newInstance();
        } catch (Exception e) {
            // If something fails, print an error and return null
            e.printStackTrace();
            return null;
        }
    }
}
