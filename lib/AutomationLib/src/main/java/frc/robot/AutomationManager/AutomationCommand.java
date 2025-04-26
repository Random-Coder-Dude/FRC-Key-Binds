package frc.robot.AutomationManager;

import java.util.HashSet;
import java.util.Set;

import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.Subsystem;

public class AutomationCommand extends Command{
    private Command[] m_CommandArray;
    
    public AutomationCommand(Automation automation) {
        m_CommandArray = automation.GenerateCommands();

        addRequirements(getrequirements(m_CommandArray));
    }

    private Set<Subsystem> getrequirements(Command[] m_CommandArray) {
        Set<Subsystem> requirements = new HashSet<>();
        for (Command command : m_CommandArray) {
            requirements.addAll(command.getRequirements());
        }
        return requirements;
    }

}
