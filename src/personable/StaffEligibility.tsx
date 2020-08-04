import React, { useState, useMemo } from "react"

import Stepper from "@material-ui/core/Stepper"
import Step from "@material-ui/core/Step"
import StepLabel from "@material-ui/core/StepLabel"
import { useGoogleLogin } from "@cs125/react-google-login"
import { usePersonable } from "./PersonableProvider"
import { P } from "../material-ui"
import { Button } from "@material-ui/core"

export const StaffEligibility: React.FC = () => {
  const steps = ["Log in", "Checking eligibility", "Join our staff!"]

  const [isEligible, setIsEligible] = useState<boolean | undefined>()

  const { isSignedIn } = useGoogleLogin()
  const personable = usePersonable()
  const you = personable && personable.you

  let activeStep = 0
  if (isSignedIn && !isEligible === undefined) {
    activeStep = 1
  } else if (isSignedIn && you) {
    activeStep = 2
  }
  const canStaff = useMemo(() => {
    const can = personable && (personable.extra?.canStaff as boolean)
    if (can !== undefined) {
      setIsEligible(can)
    }
    return can
  }, [personable])

  if (canStaff !== undefined) {
    activeStep = 3
  }
  let explanation = null
  if (activeStep === 3) {
    if (canStaff) {
      explanation = (
        <div style={{ textAlign: "center" }}>
          <div>
            <P>
              <strong>You&apos;re in!</strong> We&apos;d love to have your help this semester.
            </P>
          </div>
          <Button variant="contained" style={{ color: "white", backgroundColor: "green" }}>
            Join
          </Button>
        </div>
      )
    } else {
      explanation = (
        <P>
          Unfortunately you don&apos;t seem eligible to help out with CS 125 this semester. To be eligible you need to
          have completed CS 125, CS 126, or CS 225. If you think we&apos;ve made a mistake and would still like to help,
          please get in touch.
        </P>
      )
    }
  }
  return (
    <div style={{ width: "100%" }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          let l = label
          if (index == 2 && you && !canStaff) {
            l = "Not eligible"
          }
          return (
            <Step key={label} completed={index < activeStep}>
              <StepLabel error={index == 2 && you && !canStaff}>{l}</StepLabel>
            </Step>
          )
        })}
      </Stepper>
      {explanation}
    </div>
  )
}
