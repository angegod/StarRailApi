import { LineChart } from "@mui/x-charts/LineChart";
function Line(){


    return(<>
        <LineChart
            xAxis={[
                {
                  scaleType: "point",
                  data: ["Jan", "Feb", "Mar", "Apr", "May"],
                  sx: { tick: { label: { fill: "green", fontSize: "14px" } } },
                },
              ]}
              yAxis={[
                {
                  sx: { tick: { label: { fill: "blue", fontSize: "14px" } } },
                },
              ]}
              series={[
                { data: [10, 20, 15, 30, 25], label: "銷售額", color: "blue" },
              ]}
              width={600}
              height={350}
        />
    </>)
}
export default Line;