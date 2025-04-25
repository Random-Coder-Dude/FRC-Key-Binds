package frc.robot.AutomationManager;

import edu.wpi.first.wpilibj2.command.Command;

public class GenerateCommands extends Command {
    private final Automation m_automation;

  public GenerateCommands(Automation automation) {
    m_automation = automation;
  }

  // Called when the command is initially scheduled.
  @Override
  public void initialize() {
    
  }

  // Called every time the scheduler runs while the command is scheduled.
  @Override
  public void execute() {
    
  }

  // Called once the command ends or is interrupted.
  @Override
  public void end(boolean interrupted) {
    
  }

  // Returns true when the command should end.
  @Override
  public boolean isFinished() {
    return false;
  }
}
