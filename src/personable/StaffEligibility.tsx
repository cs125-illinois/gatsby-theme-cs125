/* eslint-disable react/prop-types */
import React, { useState, useMemo, ReactElement } from "react"

import Stepper from "@material-ui/core/Stepper"
import Step from "@material-ui/core/Step"
import StepLabel from "@material-ui/core/StepLabel"
import { useGoogleLogin } from "@cs125/react-google-login"
import { usePersonable } from "./PersonableProvider"
import { P, LeadP, A } from "../material-ui"
import Button from "@material-ui/core/Button"
import Modal from "@material-ui/core/Modal"
import Card from "@material-ui/core/Card"
import { LoginButton } from "../react-google-login"

export const StaffEligibility: React.FC<{ opener?: ReactElement }> = ({ opener = <Button>Join</Button> }) => {
  const [open, setOpen] = useState(false)

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

  const alreadyStaff = personable?.isStaff
  if (alreadyStaff || canStaff !== undefined) {
    activeStep = 3
  }

  let explanation = null
  if (activeStep === 0) {
    explanation = (
      <div style={{ textAlign: "center", paddingBottom: 16 }}>
        <LeadP>
          <strong>Please log in so we can check your eligibility.</strong>
        </LeadP>
        <LoginButton />
      </div>
    )
  } else if (activeStep === 3) {
    if (alreadyStaff) {
      explanation = (
        <div style={{ textAlign: "center" }}>
          <LeadP>
            <strong>Welcome to the course staff!</strong>
          </LeadP>
          <P>
            You should have staff access to the course forum within a few minutes. Join us{" "}
            <A href="https://cs125-forum.cs.illinois.edu/c/course-staff-discussions">there</A> for more instructions.
          </P>
        </div>
      )
    } else if (canStaff) {
      explanation = (
        <div style={{ textAlign: "center", paddingBottom: 16 }}>
          <LeadP>
            <strong>You&apos;re in!</strong> We&apos;d love to have your help this semester.
          </LeadP>
          <Button variant="contained" style={{ color: "white", backgroundColor: "green" }}>
            Join
          </Button>
        </div>
      )
    } else {
      explanation = (
        <>
          <LeadP>Unfortunately you don&apos;t seem eligible to help out with CS 125 this semester.</LeadP>
          <P>
            To be eligible you need to have completed CS 125, CS 126, or CS 225, or have staffed for CS 125 before. If
            you think we&apos;ve made a mistake and would still like to join our staff, please get in touch.
          </P>
        </>
      )
    }
  }
  return (
    <>
      {React.cloneElement(opener, { onClick: () => setOpen(true) })}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Card style={{ paddingLeft: 16, paddingRight: 16 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
              let l = label
              if (index == 2) {
                if (you && !canStaff) {
                  l = "Not eligible"
                } else if (you && alreadyStaff) {
                  l = "You're in!"
                }
              }
              return (
                <Step key={label} completed={index < activeStep}>
                  <StepLabel error={index == 2 && you && !canStaff}>{l}</StepLabel>
                </Step>
              )
            })}
          </Stepper>
          {explanation}
        </Card>
      </Modal>
    </>
  )
}
