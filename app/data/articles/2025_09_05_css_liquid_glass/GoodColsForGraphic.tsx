export const RefractionDetail: React.FC = () => {
  // Return a div grid of two columns, with three rows on left cell, and two rows on right cell.
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Refraction Detail</h2>
          <p className="text-sm text-gray-600">
            This section provides a detailed look at how light refracts through
            the liquid glass, showcasing the bending of light rays as they pass
            through the glass material.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-md font-semibold">Understanding Refraction</h3>
          <p className="text-sm text-gray-600">
            Refraction occurs when light passes from one medium to another,
            changing speed and direction. In this example, we simulate how light
            rays interact with the liquid glass, demonstrating the principles of
            refraction and how the glass's properties affect the light's path.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-md font-semibold">Ray Interaction</h3>
          <p className="text-sm text-gray-600">
            Each ray is calculated based on its origin and vector. The
            interaction with the glass is determined by checking if the ray hits
            the glass and calculating the point of intersection and the normal
            at that point. This allows us to visualize how the rays bend as they
            pass through the glass and how the glass's properties, such as
            thickness and refractive index, influence the bending.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Refraction Preview</h2>
          <p className="text-sm text-gray-600">
            The Refraction Preview component allows you to visualize how light
            rays interact with the liquid glass. You can adjust parameters like
            the refractive index and the glass dimensions to see how they affect
            the bending of light rays.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-md font-semibold">Interactive Simulation</h3>
          <p className="text-sm text-gray-600">
            The simulation provides an interactive way to understand refraction.
            By changing the refractive index and other properties, you can
            observe how the light rays change direction as they pass through the
            glass. This helps in visualizing the concept of refraction in a
            practical manner.
          </p>
        </div>
      </div>
    </div>
  );
};
