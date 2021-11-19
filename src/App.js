import "./App.css";

// import createLasso from "lasso-canvas-image";
// import ReactLassoSelect, { Component, getCanvas } from "react-lasso-select";
// import { useEffect } from "react";

import { Component, useEffect, useState } from "react";

import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import { Resizable } from "re-resizable";
import { Radio } from "antd";
import Draggable from "react-draggable";
// function App() {
//   useEffect(() => {
//     const lasso = createLasso({
//       element: document.querySelector("#layout"),
//       radius: 10,
//       onChange(polygon) {
//         console.log("Selection area changed: " + polygon);
//       },
//       onUpdate(polygon) {
//         console.log("Selection area updated: " + polygon);
//       },
//     });

//     lasso.setPath("100,100 300,100 200,200");
//     // return () => {
//     //   cleanup
//     // }
//   });

//   return (
//     <div className="App">
//       {/* <img src="/image.jpeg" alt="alt" /> */}
//       <div
//         id="layout"
//         style={{ height: 400, width: 400, background: "grey" }}
//       ></div>
//     </div>
//   );
// }

const Rectangle = ({ id, resize, x1, y1, x2, y2, rectangleChanged }) => {
  const [width, setWidth] = useState(x2 - x1);
  const [height, setHeight] = useState(y2 - y1);
  const [delta, setDelta] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setWidth(x2 - x1);
    setHeight(y2 - y1);
  }, [x2, x1, y2, y1]);

  const onResizeStop = (e, direction, ref, d) => {
    const newWidth = width + d.width;
    const newHeight = height + d.height;
    setWidth(newWidth);
    setHeight(newHeight);
    rectangleChanged(id, x1, y1, x1 + newWidth, y1 + newHeight);
  };

  const handleDrag = (e, ui) => {
    const deltaX = delta.x + ui.deltaX;
    const deltaY = delta.y + ui.deltaY;
    rectangleChanged(id, x1 + deltaX, y1 + deltaY, x2 + deltaX, y2 + deltaY);
    setDelta({ x: deltaX, y: deltaY });
  };

  const onDragStop = (e, ui) => {
    setDelta({ x: 0, y: 0 });
  };

  if (resize) {
    return (
      <div
        style={{
          zIndex: 1,
          position: "absolute",
          top: y1,
          left: x1,
        }}
      >
        <Draggable onDrag={handleDrag} onStop={onDragStop} handle=".handle">
          <Resizable
            style={{
              border: "2px dotted red",
            }}
            size={{ width, height }}
            onResizeStop={onResizeStop}
          >
            <div
              className="handle"
              style={{ height: "100%", width: "100%" }}
            ></div>
          </Resizable>
        </Draggable>
      </div>
    );
  }

  return (
    <div
      style={{
        zIndex: 1,
        position: "absolute",
        top: y1,
        left: x1,
        width: x2 - x1,
        height: y2 - y1,
        border: "2px solid red",
      }}
    ></div>
  );
};

const DrawArea = ({
  resize,
  onMouseMove,
  onMouseUp,
  onMouseDown,
  children,
}) => {
  let options = {};
  if (!resize) {
    options = { onMouseMove, onMouseUp, onMouseDown };
  }

  return (
    <div
      {...options}
      style={{
        position: "relative",
        width: 700,
        height: 700,
        overflow: "auto",
        border: "2px solid black",
      }}
    >
      {children}
    </div>
  );
};

const App = () => {
  const [rectangles, setRectangle] = useState([]);
  const [activeRectangle, setActiveRectangle] = useState(null);
  const [value, setValue] = useState(1);

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const onChangeAction = (e) => {
    setValue(e.target.value);
  };

  const onMouseUp = (e) => {
    setActiveRectangle(null);
  };
  const onMouseMove = (e) => {
    if (activeRectangle !== null) {
      rectangles[activeRectangle] = {
        ...rectangles[activeRectangle],
        x2: e.clientX - e.currentTarget.offsetLeft + e.currentTarget.scrollLeft,
        y2: e.clientY - e.currentTarget.offsetTop + e.currentTarget.scrollTop,
      };
      setRectangle([...rectangles]);
    }
  };
  const onMouseDown = (e) => {
    rectangles.push({
      x1: e.clientX - e.currentTarget.offsetLeft + e.currentTarget.scrollLeft,
      y1: e.clientY - e.currentTarget.offsetTop + e.currentTarget.scrollTop,
      x2: e.clientX - e.currentTarget.offsetLeft + e.currentTarget.scrollLeft,
      y2: e.clientY - e.currentTarget.offsetTop + e.currentTarget.scrollTop,
    });

    setActiveRectangle(rectangles.length - 1);
    setRectangle([...rectangles]);
  };

  const rectangleChanged = (id, x1, y1, x2, y2) => {
    rectangles[id] = {
      ...rectangles[id],
      x1,
      y1,
      x2,
      y2,
    };
    setRectangle([...rectangles]);
  };

  const rects = rectangles.map((r, i) => (
    <Rectangle
      rectangleChanged={rectangleChanged}
      id={i}
      resize={value !== 1}
      key={i}
      x1={r.x1}
      y1={r.y1}
      x2={r.x2}
      y2={r.y2}
    />
  ));

  return (
    <>
      <Radio.Group onChange={onChangeAction} value={value}>
        <Radio value={1}>Add New</Radio>
        <Radio value={2}>Resize</Radio>
      </Radio.Group>

      <DrawArea
        resize={value !== 1}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseDown={onMouseDown}
      >
        {rects}
        <Document
          // options={{
          //   workerSrc: "/pdf.worker.js",
          //   cMapUrl: "cmaps/",
          //   cMapPacked: true,
          // }}
          file="./sample.pdf"
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page pageNumber={pageNumber} />
        </Document>
      </DrawArea>
      {/* <p>
        Page {pageNumber} of {numPages}
      </p> */}
    </>
  );
};

export default App;
